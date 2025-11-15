"""
Integration tests for firm registration, service creation, and referral workflow.
Tests the full flow: firm register -> login -> create service -> create referral -> accept referral.
"""

from django.test import TestCase, Client
from django.urls import reverse
import json
from decimal import Decimal

from users.models import User
from firm.models import Firm
from core.models import Company, Service, ReferralRequest


class FirmWorkflowIntegrationTest(TestCase):
    """
    Test the full firm-based workflow:
    1. Register a firm and firm admin
    2. Login to get JWT token
    3. Create a service under the firm's company
    4. Create a referral request for that service
    5. Accept the referral as the firm admin
    """

    def setUp(self):
        self.client = Client()
        self.api_base = '/api'

    def test_full_firm_workflow(self):
        """Test complete workflow from firm registration to referral acceptance."""
        
        # ===== STEP 1: Create a superuser and obtain token (firm registration is admin-only) =====
        admin_user = User.objects.create_superuser(username='admin', email='admin@example.com', password='AdminPass123!')
        login_admin = {
            'username': 'admin',
            'password': 'AdminPass123!'
        }
        admin_login_resp = self.client.post('/auth/token/', data=json.dumps(login_admin), content_type='application/json')
        self.assertEqual(admin_login_resp.status_code, 200, f"Admin login failed: {admin_login_resp.content}")
        admin_token = admin_login_resp.json()['access']

        # ===== STEP 2: Register a Firm and Admin (performed by superuser) =====
        firm_register_data = {
            'username': 'test_firm_admin',
            'email': 'test_firm_admin@example.com',
            'full_name': 'Test Firm Admin',
            'password': 'SecurePass123!',
            'firm_name': 'Test Firm Inc',
            'tax_number': '12345678',
            'legal_address': '123 Business St',
            'phone_number': '555-1234',
            'location': 'New York',
            'working_hours': '9-17',
            'iban': 'US123456789'
        }
        
        response = self.client.post(
            f'{self.api_base}/core/firm/register',
            data=json.dumps(firm_register_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {admin_token}'
        )
        
        self.assertEqual(response.status_code, 200, f"Firm registration failed: {response.content}")
        response_data = response.json()
        self.assertIn('success', response_data)
        self.assertTrue(response_data['success'])
        self.assertIn('firm_id', response_data)
        self.assertIn('user_id', response_data)
        
        firm_id = response_data['firm_id']
        user_id = response_data['user_id']
        
        # Verify firm was created
        firm = Firm.objects.get(id=firm_id)
        self.assertEqual(firm.name, 'Test Firm Inc')
        self.assertTrue(firm.is_active)
        
        # Verify firm admin user was created
        admin_user = User.objects.get(id=user_id)
        self.assertEqual(admin_user.username, 'test_firm_admin')
        self.assertEqual(admin_user.firm, firm)
        self.assertTrue(admin_user.is_firm_manager)
        self.assertEqual(admin_user.role, 'firm_manager')
        
        # Verify a corresponding Company was created
        company = Company.objects.get(slug=firm.slug)
        self.assertEqual(company.name, 'Test Firm Inc')
        self.assertIsNone(company.owner)
        
    # ===== STEP 3: Login and Obtain JWT Token =====
        login_data = {
            'username': 'test_firm_admin',
            'password': 'SecurePass123!'
        }
        
        response = self.client.post(
            '/auth/token/',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200, f"Login failed: {response.content}")
        token_data = response.json()
        self.assertIn('access', token_data)
        self.assertIn('refresh', token_data)
        
        access_token = token_data['access']
        
        # ===== STEP 3: Create a Service under the firm's company =====
        service_data = {
            'company_id': company.id,
            'title': 'Web Development',
            'description': 'Professional web development services',
            'keywords': 'web, development, coding',
            'price_range_min': '1000.00',
            'price_range_max': '5000.00'
        }
        
        # We'll create the service directly via the admin since there's no public service creation endpoint
        service = Service.objects.create(
            company=company,
            title='Web Development',
            description='Professional web development services',
            keywords='web, development, coding',
            price_range_min=Decimal('1000.00'),
            price_range_max=Decimal('5000.00')
        )
        
        self.assertIsNotNone(service.id)
        self.assertEqual(service.company, company)
        
        # ===== STEP 4: Create a Referral Request =====
        referral_data = {
            'target_company_id': company.id,
            'requested_service_id': service.id,
            'customer_name': 'John Doe',
            'customer_email': 'john@example.com',
            'description': 'Looking for a website redesign'
        }
        
        response = self.client.post(
            f'{self.api_base}/core/referral/create',
            data=json.dumps(referral_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201, f"Referral creation failed: {response.content}")
        referral_response = response.json()
        self.assertIn('id', referral_response)
        
        referral_id = referral_response['id']
        
        # Verify referral was created
        referral = ReferralRequest.objects.get(id=referral_id)
        self.assertEqual(referral.target_company, company)
        self.assertEqual(referral.requested_service, service)
        self.assertEqual(referral.customer_name, 'John Doe')
        self.assertEqual(referral.status, 'pending')
        self.assertFalse(referral.is_commission_due)
        
        # ===== STEP 5: List Referrals as Firm Admin =====
        response = self.client.get(
            f'{self.api_base}/core/firm/my-referrals',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, 200, f"List referrals failed: {response.content}")
        referrals_list = response.json()
        self.assertIsInstance(referrals_list, list)
        self.assertEqual(len(referrals_list), 1)
        self.assertEqual(referrals_list[0]['id'], referral_id)
        
        # ===== STEP 6: Accept the Referral =====
        accept_data = {
            'action': 'accept'
        }
        
        response = self.client.post(
            f'{self.api_base}/core/company/request/{referral_id}/action',
            data=json.dumps(accept_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, 200, f"Accept referral failed: {response.content}")
        accept_response = response.json()
        self.assertTrue(accept_response['success'])
        self.assertIn('message', accept_response)
        
        # Verify referral status changed
        referral.refresh_from_db()
        self.assertEqual(referral.status, 'accepted')
        self.assertTrue(referral.is_commission_due)
        
        # ===== STEP 7: Reject Another Referral (create and reject) =====
        referral2_data = {
            'target_company_id': company.id,
            'requested_service_id': service.id,
            'customer_name': 'Jane Smith',
            'customer_email': 'jane@example.com',
            'description': 'E-commerce platform needed'
        }
        
        response = self.client.post(
            f'{self.api_base}/core/referral/create',
            data=json.dumps(referral2_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 201)
        referral2_id = response.json()['id']
        
        # Reject the referral
        reject_data = {
            'action': 'reject'
        }
        
        response = self.client.post(
            f'{self.api_base}/core/company/request/{referral2_id}/action',
            data=json.dumps(reject_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        reject_response = response.json()
        self.assertTrue(reject_response['success'])
        
        # Verify referral was rejected
        referral2 = ReferralRequest.objects.get(id=referral2_id)
        self.assertEqual(referral2.status, 'rejected')
        self.assertFalse(referral2.is_commission_due)


class OwnershipPermissionTest(TestCase):
    """
    Test that firm users can only access their own company's referrals and actions.
    """

    def setUp(self):
        self.client = Client()
        
        # Create first firm
        self.firm1 = Firm.objects.create(
            name='Firm One',
            slug='firm-one',
            location='New York'
        )
        self.company1 = Company.objects.create(
            name='Firm One',
            slug='firm-one',
            description='',
            location_text='New York'
        )
        self.user1 = User.objects.create_user(
            username='admin1',
            email='admin1@example.com',
            password='Pass123!',
            firm=self.firm1,
            is_firm_manager=True,
            role='firm_manager'
        )
        
        # Create second firm
        self.firm2 = Firm.objects.create(
            name='Firm Two',
            slug='firm-two',
            location='Los Angeles'
        )
        self.company2 = Company.objects.create(
            name='Firm Two',
            slug='firm-two',
            description='',
            location_text='Los Angeles'
        )
        self.user2 = User.objects.create_user(
            username='admin2',
            email='admin2@example.com',
            password='Pass123!',
            firm=self.firm2,
            is_firm_manager=True,
            role='firm_manager'
        )
        
        # Create service for firm1
        self.service1 = Service.objects.create(
            company=self.company1,
            title='Service 1',
            description='Service for Firm One'
        )
        
        # Create referral for firm1
        self.referral1 = ReferralRequest.objects.create(
            target_company=self.company1,
            requested_service=self.service1,
            customer_name='Customer One',
            customer_email='customer1@example.com'
        )

    def test_firm_user_can_access_own_referrals(self):
        """Test that a firm user can access referrals for their own company."""
        login_data = {
            'username': 'admin1',
            'password': 'Pass123!'
        }
        
        response = self.client.post(
            '/auth/token/',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        token = response.json()['access']
        
        response = self.client.get(
            '/api/core/firm/my-referrals',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        
        self.assertEqual(response.status_code, 200)
        referrals = response.json()
        self.assertEqual(len(referrals), 1)
        self.assertEqual(referrals[0]['id'], self.referral1.id)

    def test_firm_user_cannot_access_other_firm_referrals(self):
        """Test that a firm user cannot access referrals from another firm."""
        # Create a referral for firm2
        service2 = Service.objects.create(
            company=self.company2,
            title='Service 2',
            description='Service for Firm Two'
        )
        referral2 = ReferralRequest.objects.create(
            target_company=self.company2,
            requested_service=service2,
            customer_name='Customer Two',
            customer_email='customer2@example.com'
        )
        
        # Login as user1 (firm1)
        login_data = {
            'username': 'admin1',
            'password': 'Pass123!'
        }
        
        response = self.client.post(
            '/auth/token/',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        token = response.json()['access']
        
        # User1 should only see their own referral, not referral2
        response = self.client.get(
            '/api/core/firm/my-referrals',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        
        self.assertEqual(response.status_code, 200)
        referrals = response.json()
        self.assertEqual(len(referrals), 1)
        self.assertEqual(referrals[0]['id'], self.referral1.id)
        self.assertNotEqual(referrals[0]['id'], referral2.id)

    def test_firm_user_cannot_accept_other_firm_referrals(self):
        """Test that a firm user cannot accept referrals from another firm."""
        # Create a referral for firm2
        service2 = Service.objects.create(
            company=self.company2,
            title='Service 2',
            description='Service for Firm Two'
        )
        referral2 = ReferralRequest.objects.create(
            target_company=self.company2,
            requested_service=service2,
            customer_name='Customer Two',
            customer_email='customer2@example.com'
        )
        
        # Login as user1 (firm1)
        login_data = {
            'username': 'admin1',
            'password': 'Pass123!'
        }
        
        response = self.client.post(
            '/auth/token/',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        
        token = response.json()['access']
        
        # User1 should not be able to accept referral2 (which belongs to firm2)
        accept_data = {
            'action': 'accept'
        }
        
        response = self.client.post(
            f'/api/core/company/request/{referral2.id}/action',
            data=json.dumps(accept_data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}'
        )
        
        self.assertEqual(response.status_code, 403, f"Expected 403, got {response.status_code}: {response.content}")
        
        # Verify referral2 is still pending
        referral2.refresh_from_db()
        self.assertEqual(referral2.status, 'pending')
