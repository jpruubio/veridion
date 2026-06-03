const BACKEND_URL = 'https://veridion-5tjh.onrender.com';

const botaoCriar = document.getElementById('criar');

botaoCriar.addEventListener('click', async (event) => {
    event.preventDefault();

    const nome  = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!nome || !email || !senha) {
        alert('Preencha todos os campos.');
        return;
    }

    botaoCriar.disabled = true;
    botaoCriar.value    = 'Criando conta...';

    try {
        const resposta = await fetch(`${BACKEND_URL}/cadastro`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ nome, email, senha }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao cadastrar.');
            botaoCriar.disabled = false;
            botaoCriar.value    = 'Criar minha conta';
            return;
        }

        await mostrarSucesso();

        chrome.runtime.sendMessage({
            type:  'LOGIN_SUCCESS',
            token: dados.token,
            user:  dados.usuario,
        });

    } catch (erro) {
        console.error('[cadastro] Erro:', erro);
        alert('Erro ao conectar com o servidor.');
        botaoCriar.disabled = false;
        botaoCriar.value    = 'Criar minha conta';
    }
});

function mostrarSucesso() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('ver-login-overlay');
        overlay.classList.add('ver-ativo');
        overlay.setAttribute('aria-hidden', 'false');
        setTimeout(resolve, 1600);
    });
}
