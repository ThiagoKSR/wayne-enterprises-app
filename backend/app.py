from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
import jwt
from datetime import datetime, timedelta
from functools import wraps # Nova importação

# --- CONFIGURAÇÃO DA APLICAÇÃO ---
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'sua-chave-secreta-super-dificil'

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '254600', # ⚠️ Lembre-se de usar sua senha
    'database': 'wayne_industries'
}

# --- FUNÇÃO PARA CONECTAR AO BANCO ---
def get_db_connection():
    try:
        conn = mysql.connector.connect(**db_config)
        return conn
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None

# --- DECORADOR PARA PROTEGER ROTAS ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # O token é enviado pelo header da requisição
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']

        if not token:
            return jsonify({'message': 'Token é obrigatório!'}), 401

        try:
            # Decodifica o token usando nossa SECRET_KEY
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # Busca o usuário no banco com o id que estava no token
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            # Dentro do decorador token_required, mude a linha da query para:
            cursor.execute("SELECT id, nome, id_papel FROM usuarios WHERE id = %s", (data['user_id'],))
            current_user = cursor.fetchone()
            cursor.close()
            conn.close()
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirou!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token é inválido!'}), 401
        
        # Se tudo deu certo, a rota original (f) é executada
        # e passamos o usuário logado como parâmetro
        return f(current_user, *args, **kwargs)
    return decorated

# --- ROTA DE LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email e senha são obrigatórios"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500

    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()
        if user and bcrypt.checkpw(password.encode('utf-8'), user['senha_hash'].encode('utf-8')):
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.utcnow() + timedelta(hours=1)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({'token': token})
        else:
            return jsonify({'message': 'Credenciais inválidas'}), 401
    finally:
        cursor.close()
        conn.close()

# --- NOVA ROTA PROTEGIDA PARA LISTAR RECURSOS ---
@app.route('/api/recursos', methods=['GET'])
@token_required # <-- A MÁGICA ACONTECE AQUI!
def get_all_recursos(current_user): # A função agora recebe o usuário que foi validado pelo decorador
    # Se chegamos até aqui, o token é válido e current_user contém os dados do usuário logado.
    print(f"Usuário '{current_user['nome']}' acessou os recursos.") # Log no terminal

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, nome, tipo, descricao, status FROM recursos")
    recursos = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(recursos)

# --- ROTA PARA CRIAR UM RECURSO (COM DEBUG) ---
@app.route('/api/recursos', methods=['POST'])
@token_required
def create_recurso(current_user):
    print("\n--- INICIANDO REQUEST PARA CRIAR RECURSO ---") # DEBUG
    
    if current_user['id_papel'] not in [2, 3]:
        print("!!! FALHA DE AUTORIZAÇÃO !!!") # DEBUG
        return jsonify({'message': 'Permissão negada!'}), 403

    print("Autorização OK.") # DEBUG
    data = request.get_json()
    print(f"Dados recebidos do frontend: {data}") # DEBUG

    nome = data.get('nome')
    tipo = data.get('tipo')
    descricao = data.get('descricao')
    status = data.get('status')

    if not nome or not tipo or not status:
        print("!!! FALHA DE VALIDAÇÃO (CAMPOS OBRIGATÓRIOS) !!!") # DEBUG
        return jsonify({'message': 'Campos obrigatórios (nome, tipo, status) não foram preenchidos'}), 400

    print("Validação OK.") # DEBUG
    conn = get_db_connection()
    if not conn:
        print("!!! FALHA DE CONEXÃO COM O BANCO !!!") # DEBUG
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    print("Conexão com o banco OK.") # DEBUG
    cursor = conn.cursor()
    try:
        query = "INSERT INTO recursos (nome, tipo, descricao, status) VALUES (%s, %s, %s, %s)"
        print("Executando a query SQL...") # DEBUG
        cursor.execute(query, (nome, tipo, descricao, status))
        print("Query executada. Realizando commit...") # DEBUG
        conn.commit() # Salva as mudanças no banco de dados
        print("✅ COMMIT REALIZADO COM SUCESSO! ✅") # DEBUG
        
        return jsonify({'status': 'success', 'message': 'Recurso adicionado com sucesso!'}), 201

    except Error as e:
        conn.rollback() 
        print(f"❌ ERRO NO BLOCO TRY: {e} ❌") # DEBUG
        return jsonify({'message': 'Erro ao inserir recurso no banco de dados'}), 500
    finally:
        cursor.close()
        conn.close()
        print("--- FINALIZANDO REQUEST ---\n") # DEBUG

        # --- NOVA ROTA PARA ATUALIZAR UM RECURSO (UPDATE) ---
@app.route('/api/recursos/<int:id>', methods=['PUT'])
@token_required
def update_recurso(current_user, id):
    # Autorização: Apenas Gerentes e Administradores podem atualizar.
    if current_user['id_papel'] not in [2, 3]:
        return jsonify({'message': 'Permissão negada!'}), 403

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Primeiro, verifica se o recurso existe
        cursor.execute("SELECT * FROM recursos WHERE id = %s", (id,))
        recurso_existente = cursor.fetchone()
        if not recurso_existente:
            return jsonify({'message': 'Recurso não encontrado'}), 404

        # Pega os dados enviados para atualização
        data = request.get_json()
        
        # Usa os dados existentes como base e atualiza apenas o que foi enviado
        nome = data.get('nome', recurso_existente['nome'])
        tipo = data.get('tipo', recurso_existente['tipo'])
        descricao = data.get('descricao', recurso_existente['descricao'])
        status = data.get('status', recurso_existente['status'])

        # Query SQL para atualizar o recurso
        query = "UPDATE recursos SET nome = %s, tipo = %s, descricao = %s, status = %s WHERE id = %s"
        cursor.execute(query, (nome, tipo, descricao, status, id))
        conn.commit()

        return jsonify({'status': 'success', 'message': 'Recurso atualizado com sucesso!'})

    except Error as e:
        conn.rollback()
        print(e)
        return jsonify({'message': 'Erro ao atualizar recurso no banco de dados'}), 500
    finally:
        cursor.close()
        conn.close()

        # --- NOVA ROTA PARA DELETAR UM RECURSO (DELETE) ---
@app.route('/api/recursos/<int:id>', methods=['DELETE'])
@token_required
def delete_recurso(current_user, id):
    # Autorização: Apenas Administradores (3) podem deletar.
    if current_user['id_papel'] != 3:
        return jsonify({'message': 'Permissão negada! Apenas administradores podem deletar recursos.'}), 403

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Primeiro, verifica se o recurso existe
        cursor.execute("SELECT * FROM recursos WHERE id = %s", (id,))
        recurso_existente = cursor.fetchone()
        if not recurso_existente:
            return jsonify({'message': 'Recurso não encontrado'}), 404

        # Query SQL para deletar o recurso
        query = "DELETE FROM recursos WHERE id = %s"
        cursor.execute(query, (id,))
        conn.commit()

        return jsonify({'status': 'success', 'message': 'Recurso deletado com sucesso!'})

    except Error as e:
        conn.rollback()
        print(e)
        return jsonify({'message': 'Erro ao deletar recurso no banco de dados'}), 500
    finally:
        cursor.close()
        conn.close()

# --- ROTA PARA BUSCAR UM ÚNICO RECURSO POR ID ---
@app.route('/api/recursos/<int:id>', methods=['GET'])
@token_required
def get_recurso_por_id(current_user, id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM recursos WHERE id = %s", (id,))
    recurso = cursor.fetchone()
    cursor.close()
    conn.close()

    if recurso:
        return jsonify(recurso)
    else:
        return jsonify({"message": "Recurso não encontrado"}), 404
    
    # --- NOVA ROTA PARA ESTATÍSTICAS DO DASHBOARD ---
@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    print("Usuário está a aceder às estatísticas.") # DEBUG

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Não foi possível conectar ao banco de dados"}), 500
    
    cursor = conn.cursor(dictionary=True)
    try:
        # Query que agrupa os recursos por status e conta quantos há em cada grupo
        query = "SELECT status, COUNT(*) as count FROM recursos GROUP BY status"
        cursor.execute(query)
        stats = cursor.fetchall()
        
        # A resposta da query será algo como: 
        # [{'status': 'Operacional', 'count': 8}, {'status': 'Em Manutenção', 'count': 4}]
        
        return jsonify(stats)

    except Error as e:
        print(f"Erro ao buscar estatísticas: {e}")
        return jsonify({'message': 'Erro ao buscar estatísticas'}), 500
    finally:
        cursor.close()
        conn.close()
# --- PONTO DE ENTRADA ---
if __name__ == '__main__':
    app.run(debug=True)