// Guarda toda a expressão introduzida
let valorIntroduzido = "";


const servidor = "http://127.0.0.1:5000/calcular";
const servidorHis="http://127.0.0.1:5000/historico";

const OPERADORES = ['+', '-', 'x', '/','^','%','(1/'];


function adicionarValor(valor) {

    const ultimo = valorIntroduzido.slice(-1); //Para saber o ultimo carater ou elemento

    //Evitar dois operadores seguidos (mas NÃO bloquear sqrt)
    if (OPERADORES.includes(valor) && OPERADORES.includes(ultimo)){ //Verificar se o botão é um operador e se o ultimo carater é um operador 
        return; //retorna vázio ou não adiciona nada
    }

    if(valor ==="sqrt(") { //Verificar se o operador é raiz 
        if(/\d|\)/.test(ultimo)){ //Verificar o que está antes da raiz. \d significa qualquer digito de 0 a 9
            valorIntroduzido += "*" + valor;
        }else{
            valorIntroduzido += valor;
        }

    } else {
        // 3️⃣ Qualquer outro valor
        valorIntroduzido += valor;
    }

    atualizarDisplay();
}

function atualizarDisplay() {
    document.getElementById("display").innerText = valorIntroduzido === "" ? "0" : valorIntroduzido;
}


function apagar() {
    if (valorIntroduzido.length > 0) {
        valorIntroduzido = valorIntroduzido.slice(0, -1);
    }

    atualizarDisplay();
}


function apagarTudo() {
    valorIntroduzido = "";
    atualizarDisplay();

}

function processarExpressao(expressao){ //Transformar a expressão em linguagem que o servidor percebe
    return expressao
        .replace(/x/g, "*")
        .replace(/\^/g, "**")
        .replace(/R\(/g,"sqrt(")
}


function enviarParaJson() {

    if (valorIntroduzido === "") {
        alert("Expressão vazia!");
        return;
    }
    const expressaoPronta= processarExpressao(valorIntroduzido)
    console.log("Enviar para servidor:", expressaoPronta);
    fetch(servidor, {
        method: "POST",
        headers: {"Content-Type": "application/json"
        },
        body: JSON.stringify({ expressao: expressaoPronta})
    })
    .then(response => response.json())
    .then(data => {

        if (data.erro) {
            alert(data.erro);
            return;
        }

        valorIntroduzido = data.resultado.toString();
       atualizarDisplay();
    })
    .catch(error => {
        console.error("Erro:", error);
        alert("Erro ao comunicar com o servidor");
    });
}





async function carregarHistorico() {
    try {
        const resposta = await fetch(servidorHis);
        const dados = await resposta.json();

        const corpoTabela = document.getElementById("tabela-corpo");
        corpoTabela.innerHTML = ""; // Limpar tabela antes de adicionar

        dados.forEach(item => {
            const linha = `<tr>
                <th scope="row">${item.id}</th>
                <td>${item.expressao}</td>
                <td>${item.resultado}</td>
            </tr>`;
            corpoTabela.innerHTML += linha;
        });

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}
