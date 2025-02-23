document.addEventListener("DOMContentLoaded", () => {
    getJsonAPI(); // carrega os dados da web ao iniciar
});

function mostrarSecao(secaoId) {
    document.getElementById('inserir').classList.add('d-none');
    document.getElementById('listar').classList.add('d-none');
    document.getElementById('alterar').classList.add('d-none');
    document.getElementById('deletar').classList.add('d-none');

    // exibi a escolhida
    document.getElementById(secaoId).classList.remove('d-none');

    // atualiza a classe active no menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // ativa o link clicado
    event.currentTarget.classList.add('active');
}

function exibirMensagem(texto, tipo) {
    let msgDiv = document.getElementById("mensagem");
    msgDiv.textContent = texto;
    msgDiv.className = `alert alert-${tipo} mt-2`;
    msgDiv.classList.remove("d-none");

    // esconde mensagem depois de 3 segundos
    setTimeout(() => {
        msgDiv.classList.add("d-none");
    }, 3000);
}

function validarCampos(campos) {
    for (let campo of campos) {
        if (!campo.value.trim()) {
            exibirMensagem(`O campo "${campo.placeholder}" não pode estar vazio!`, "warning");
            campo.focus();
            return false;
        }
    }
    return true;
}

function limparInputs() {
    document.getElementById('titulo').value = "";
    document.getElementById('url').value = "";
    document.getElementById('deleteId').value = "";
    document.getElementById('alterarId').value = "";
    document.getElementById('tituloAlterar').value = "";
    document.getElementById('urlAlterar').value = "";
}

async function addItem() {
    let titulo = document.getElementById('titulo');
    let url = document.getElementById('url');

    if (!validarCampos([titulo, url])) {
        return;
    }

    let items = JSON.parse(localStorage.getItem('fotos'));
    let id = items.length ? items[items.length - 1].id + 1 : 1;

    const novaFoto = {
        id: id,
        title: titulo.value,
        url: url.value,
    };

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/photos', {
            method: 'POST',
            body: JSON.stringify(novaFoto),
            headers: { 'Content-Type': 'application/json' }
        });

        // const data = await response.json();
        items.push(novaFoto);
        localStorage.setItem('fotos', JSON.stringify(items));
        await carregarListaItens();
        await limparInputs();
        exibirMensagem("Item adicionado com sucesso!", "success");
    } catch (error) {
        exibirMensagem("Erro ao adicionar item", "danger");
    }
}

async function carregarListaItens() {
    let items = JSON.parse(localStorage.getItem('fotos'));
    let tabela = document.getElementById('tabelaFotos');
    tabela.innerHTML = "";

    items.forEach(item => {
        const row = `<tr><td>${item.id}</td><td>${item.title}</td><td><img src="${item.url}" width="50"></td></tr>`;
        tabela.innerHTML += row;
    });
}

async function alterarItem() {
    let id = document.getElementById('alterarId');
    let title = document.getElementById('tituloAlterar');
    let url = document.getElementById('urlAlterar');

    if (!validarCampos([id, title, url])) {
        return;
    }

    id = parseInt(id.value)
    title = title.value
    url = url.value

    let items = JSON.parse(localStorage.getItem('fotos')) || [];
    let index = items.findIndex(item => item.id === id);

    if (index !== -1) {
        const fotoAtualizada = { ...items[index], title, url };

        try {
            await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(fotoAtualizada),
                headers: { 'Content-Type': 'application/json' }
            });

            items[index] = fotoAtualizada;
            localStorage.setItem('fotos', JSON.stringify(items));
            await carregarListaItens();
            await limparInputs();
            exibirMensagem("Item atualizado com sucesso!", "success");
        } catch (error) {
            exibirMensagem("Erro ao atualizar item!", "danger");
        }
    } else {
        exibirMensagem("Id não encontrado!", "danger");
    }
}

async function deletarItem() {
    let id = document.getElementById('deleteId');

    if (!validarCampos([id])){
        return;
    }

    id = parseInt(id.value)

    let items = JSON.parse(localStorage.getItem('fotos')) || [];
    const index = items.findIndex(item => item.id === id);

    if (index !== -1) {
        try {
            await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
                method: 'DELETE'
            });

            items = items.filter(item => item.id !== id);
            localStorage.setItem('fotos', JSON.stringify(items));
            await carregarListaItens();
            await limparInputs();
            exibirMensagem("Item excluído com sucesso!", "success");
        } catch (error) {
            exibirMensagem("Erro ao excluir!", "danger");
        }
    } else {
        exibirMensagem("Id não encontrado!", "danger");
    }
}

async function getJsonAPI() {
    // pega as informações da api
    const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=10');
    const fotosWeb = await response.json();

    const localFotos = JSON.parse(localStorage.getItem('fotos')) || [];
    
    const todasFotos = localFotos.length === 0 ? [...fotosWeb] : [...localFotos];

    localStorage.setItem('fotos', JSON.stringify(todasFotos));

    await carregarListaItens();
}