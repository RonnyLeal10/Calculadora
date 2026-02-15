from flask import Flask, request, jsonify
from flask_cors import CORS
import ast
import operator
import math
import sqlite3

app = Flask(__name__)
CORS(app)

# Operadores permitidos
OPERADORES = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Mod: operator.mod,     # % → RESTO
    ast.Pow: operator.pow      # **
}

# Funções permitidas
FUNCOES = {
    "sqrt": math.sqrt
}

def avaliar(no):
    #Operações Binárias
    if isinstance(no, ast.BinOp):
        return OPERADORES[type(no.op)](
            avaliar(no.left),
            avaliar(no.right)
        )

    #Operações unárias
    elif isinstance(no, ast.UnaryOp):
        return -avaliar(no.operand)

    #Números
    elif isinstance(no, ast.Constant):
        return no.value

    #Funções: sqrt(x)
    elif isinstance(no, ast.Call):
        nome = no.func.id # Obter o nome da função como string
        if nome not in FUNCOES: #Verificar se é uma função permitida
            raise ValueError("Função não permitida")
        return FUNCOES[nome](avaliar(no.args[0]))

    else:
        raise ValueError("Expressão inválida")


@app.route("/calcular", methods=["POST"])
def calcular():
    dados = request.get_json()

    if not dados or "expressao" not in dados:
        return jsonify({"erro": "Nenhuma expressão recebida"}), 400

    expressao = dados["expressao"]

    try:
        arvore = ast.parse(expressao, mode="eval").body
        resultado = avaliar(arvore)
        e=expressao
        r=resultado
        
        #guardarBD(e,r)
        
        return jsonify({"resultado": resultado})
        
    except Exception:
        return jsonify({"erro": "Expressão inválida"}), 400



def guardarBD(expressao, resultado):
    x=sqlite3.connect("BD/DT_calculadora.db")
    cursor=x.cursor()
    cursor.execute("INSERT INTO Historico (expressao, resultado) VALUES (?,?)", (expressao, str(resultado)))
    x.commit()
    x.close()
    
@app.route("/historico", methods=["GET"])
def historico_x():
    x=sqlite3.connect("BD/DT_calculadora.db")
    cursor=x.cursor()
    cursor.execute("SELECT IdHis, expressao, resultado FROM Historico ORDER BY IdHis DESC")
    linhas = cursor.fetchall()
    x.close()
    dados = [{"id": linha[0], "expressao": linha[1], "resultado": linha[2]} for linha in linhas]
    return jsonify(dados)
    

if __name__ == "__main__":
    app.run(debug=True)
