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
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao fazer login.');
            return;
        }

        // salva token
        localStorage.setItem('token', dados.token);

        // salva dados do usuário
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        alert('Login realizado com sucesso!');

        // futuramente:
        // window.location.href = '../extensao/home.html';

    } catch (erro) {
        console.error(erro);
        alert('Erro ao conectar com o servidor.');
    }
});