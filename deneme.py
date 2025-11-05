from cryptography.fernet import Fernet
key = Fernet.generate_key()
print(key.decode()) 
# Çıktı, tırnak işaretleri olmadan almanız gereken 32 karakterlik anahtardır.