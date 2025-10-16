import bcrypt

# A senha que queremos usar
password = "batman"

# Codifica a senha para bytes
bytes = password.encode('utf-8')

# Gera o "sal" e cria o hash
salt = bcrypt.gensalt()
hash = bcrypt.hashpw(bytes, salt)

# Imprime o hash final no terminal
print("Seu novo hash é:")
print(hash.decode('utf-8'))