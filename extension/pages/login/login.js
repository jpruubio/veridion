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

        // Exibe a animação de sucesso e só depois envia a mensagem
        // para o background, dando tempo do usuário ver o feedback.
        await mostrarSucesso();

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

/**
 * Ativa o overlay de sucesso com as animações CSS e aguarda
 * tempo suficiente para o usuário ler a mensagem antes de
 * a extensão fechar/redirecionar o popup.
 *
 * @returns {Promise<void>} Resolve após ~1.6 s (animação + leitura).
 */
function mostrarSucesso() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('ver-login-overlay');

        // Adicionar "ver-ativo" dispara todas as transições CSS definidas
        // no login.css: escala do círculo, desenho do check, fade dos textos.
        overlay.classList.add('ver-ativo');
        overlay.setAttribute('aria-hidden', 'false');

        // Aguarda o tempo das animações (a mais longa termina em ~1 s)
        // mais uma pausa extra para leitura confortável, totalizando 1.6 s.
        setTimeout(resolve, 1600);
    });
}
