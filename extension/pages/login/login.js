// ============================================================
//  Veridion — login.js
//  Autenticação + fluxo completo de redefinição de senha
// ============================================================

const API = 'https://veridion-5tjh.onrender.com';

// ──────────────────────────────────────────────────────────────
//  Utilitários
// ──────────────────────────────────────────────────────────────

/** Ativa o overlay de sucesso de login e aguarda as animações. */
function mostrarSucesso() {
    return new Promise((resolve) => {
        const overlay = document.getElementById('ver-login-overlay');
        overlay.classList.add('ver-ativo');
        overlay.setAttribute('aria-hidden', 'false');
        setTimeout(resolve, 1600);
    });
}

/** Coloca um botão em estado de loading (desativa + mostra spinner). */
function setLoading(btn, ativo) {
    btn.disabled = ativo;
    btn.classList.toggle('ver-btn--loading', ativo);
}

/** Exibe mensagem de erro num elemento de alerta. */
function mostrarErro(elementoId, msg) {
    const el = document.getElementById(elementoId);
    el.textContent = msg;
    el.style.display = msg ? 'block' : 'none';
}

// ──────────────────────────────────────────────────────────────
//  Login principal
// ──────────────────────────────────────────────────────────────

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
        const resposta = await fetch(`${API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json();
        if (!resposta.ok) {
            alert(dados.erro || 'Erro ao fazer login.');
            return;
        }
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

// ──────────────────────────────────────────────────────────────
//  Modal de redefinição de senha
// ──────────────────────────────────────────────────────────────

const modalOverlay = document.getElementById('ver-modal-overlay');

/** Abre o modal e vai para o passo indicado (1, 2 ou 3). */
function abrirModal(passo = 1) {
    modalOverlay.removeAttribute('aria-hidden');
    modalOverlay.classList.add('ver-modal--aberto');
    irParaPasso(passo);
}

/** Fecha o modal e limpa os campos. */
function fecharModal() {
    modalOverlay.setAttribute('aria-hidden', 'true');
    modalOverlay.classList.remove('ver-modal--aberto');
    // Limpa campos e erros
    ['reset-email', 'reset-token', 'reset-nova-senha', 'reset-confirmar-senha']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    mostrarErro('ver-erro-p1', '');
    mostrarErro('ver-erro-p2', '');
    irParaPasso(1);
}

/** Exibe o passo correto e esconde os demais. */
function irParaPasso(n) {
    [1, 2, 3].forEach(i => {
        const el = document.getElementById(`ver-passo-${i}`);
        if (el) el.hidden = (i !== n);
    });
}

// Abrir ao clicar em "Esqueci minha senha"
document.getElementById('btn-esqueci-senha').addEventListener('click', (e) => {
    e.preventDefault();
    abrirModal(1);
});

// Fechar pelo botão X
document.getElementById('ver-modal-fechar').addEventListener('click', fecharModal);

// Fechar ao clicar fora do card
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) fecharModal();
});

// Fechar com Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hasAttribute('aria-hidden')) fecharModal();
});

// Voltar ao passo 1
document.getElementById('btn-voltar-p1').addEventListener('click', () => irParaPasso(1));

// Fechar após sucesso
document.getElementById('btn-fechar-sucesso').addEventListener('click', fecharModal);

// ── Passo 1: solicitar token ──────────────────────────────────

document.getElementById('btn-solicitar-token').addEventListener('click', async () => {
    const btn   = document.getElementById('btn-solicitar-token');
    const email = document.getElementById('reset-email').value.trim();

    mostrarErro('ver-erro-p1', '');

    if (!email) {
        mostrarErro('ver-erro-p1', 'Informe seu e-mail.');
        return;
    }

    setLoading(btn, true);
    try {
        const resp  = await fetch(`${API}/esqueci-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const dados = await resp.json();

        if (!resp.ok) {
            mostrarErro('ver-erro-p1', dados.erro || 'Erro ao solicitar redefinição.');
            return;
        }

        // Em dev, o token vem na resposta; em prod, chegaria por e-mail.
        if (dados.token_dev) {
            document.getElementById('reset-token').value = dados.token_dev;
        }

        irParaPasso(2);
    } catch (err) {
        console.error(err);
        mostrarErro('ver-erro-p1', 'Erro ao conectar com o servidor.');
    } finally {
        setLoading(btn, false);
    }
});

// ── Passo 2: validar requisitos de senha em tempo real ────────

const REQUISITOS = [
    { id: 'req-min',   test: s => s.length >= 8 },
    { id: 'req-upper', test: s => /[A-Z]/.test(s) },
    { id: 'req-lower', test: s => /[a-z]/.test(s) },
    { id: 'req-num',   test: s => /\d/.test(s)    },
    { id: 'req-esp',   test: s => /[\W_]/.test(s) },
];

document.getElementById('reset-nova-senha').addEventListener('input', function () {
    REQUISITOS.forEach(({ id, test }) => {
        const ok = test(this.value);
        const li = document.getElementById(id);
        li.classList.toggle('ver-req--ok',   ok);
        li.classList.toggle('ver-req--fail', !ok && this.value.length > 0);
        const icon = li.querySelector('i');
        if (icon) icon.className = ok ? 'ti ti-circle-check' : 'ti ti-circle';
    });
});

// Toggle visibilidade de senha
['toggle-nova-senha', 'toggle-confirmar-senha'].forEach(btnId => {
    const btn   = document.getElementById(btnId);
    const campo = btnId === 'toggle-nova-senha'
        ? document.getElementById('reset-nova-senha')
        : document.getElementById('reset-confirmar-senha');

    btn.addEventListener('click', () => {
        const visivel = campo.type === 'text';
        campo.type    = visivel ? 'password' : 'text';
        btn.querySelector('i').className = visivel ? 'ti ti-eye' : 'ti ti-eye-off';
        btn.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
    });
});

// ── Passo 2: submeter nova senha ──────────────────────────────

document.getElementById('btn-redefinir-senha').addEventListener('click', async () => {
    const btn          = document.getElementById('btn-redefinir-senha');
    const token        = document.getElementById('reset-token').value.trim();
    const novaSenha    = document.getElementById('reset-nova-senha').value;
    const confirmar    = document.getElementById('reset-confirmar-senha').value;

    mostrarErro('ver-erro-p2', '');

    if (!token) {
        mostrarErro('ver-erro-p2', 'Cole o código de redefinição.');
        return;
    }
    if (!novaSenha) {
        mostrarErro('ver-erro-p2', 'Informe a nova senha.');
        return;
    }
    if (novaSenha !== confirmar) {
        mostrarErro('ver-erro-p2', 'As senhas não coincidem.');
        return;
    }

    setLoading(btn, true);
    try {
        const resp  = await fetch(`${API}/redefinir-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, novaSenha })
        });
        const dados = await resp.json();

        if (!resp.ok) {
            mostrarErro('ver-erro-p2', dados.erro || 'Erro ao redefinir a senha.');
            return;
        }

        irParaPasso(3);
    } catch (err) {
        console.error(err);
        mostrarErro('ver-erro-p2', 'Erro ao conectar com o servidor.');
    } finally {
        setLoading(btn, false);
    }
});
