const botaoEntrar = document.getElementById('entrar');

botaoEntrar.addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        alert('Preencha e-mail e senha.');
        return;
    }

    try {
        const resposta = await fetch('https://veridion-5tjh.onrender.com/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao fazer login.');
            return;
        }

        chrome.runtime.sendMessage({
            type: 'LOGIN_SUCCESS',
            token: dados.token,
            user: dados.usuario
        });

    } catch (erro) {
        console.error(erro);
        alert('Erro ao conectar com o servidor.');
    }
}); 