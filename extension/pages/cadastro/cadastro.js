const botaoCriar = document.getElementById('criar');

botaoCriar.addEventListener('click', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    if (!nome || !email || !senha) {
        alert('Preencha todos os campos.');
        return;
    }

    try {
        const resposta = await fetch('https://veridion-5tjh.onrender.com/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao cadastrar.');
            return;
        }

        // salva token no navegador
        localStorage.setItem('token', dados.token);

        alert('Cadastro realizado com sucesso!');

        // redireciona
        window.location.href = '../login/login.html';

    } catch (erro) {
        console.error(erro);
        alert('Erro ao conectar com o servidor.');
    }
});
