import bcrypt

password = "batman"

bytes = password.encode('utf-8')

salt = bcrypt.gensalt()
hash = bcrypt.hashpw(bytes, salt)

# Impressão do hash gerado para copiar =)
print("Seu novo hash é:")
print(hash.decode('utf-8'))