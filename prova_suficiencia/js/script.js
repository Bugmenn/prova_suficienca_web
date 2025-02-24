document.addEventListener("DOMContentLoaded", () => {
    getJsonAPI(); // carrega os dados da web ao iniciar
});

function mostrarSecao(secaoId) {
    // faz com que todas a seções fiquem invisiveis
    document.querySelectorAll('.card').forEach(secao => secao.classList.add('d-none'));

    // exibi a escolhida
    document.getElementById(secaoId).classList.remove('d-none');

    // atualiza pelos botões da navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active', 'bg-success', 'bg-secondary', 'bg-warning', 'bg-danger');
    });
    
    // evento ao clicar pelo botões da listagem
    let linkAtivo = document.querySelector(`.nav-link[href="#"][onclick="mostrarSecao('${secaoId}')"]`);
    if (linkAtivo) {
        linkAtivo.classList.add('active');

        switch (secaoId) {
            case "inserir":
                linkAtivo.classList.add('bg-success');
                break;
            case "listar":
                linkAtivo.classList.add('bg-secondary');
                break;
            case "alterar":
                linkAtivo.classList.add('bg-warning');
                break;
            case "deletar":
                linkAtivo.classList.add('bg-danger');
                break;
        }
    }
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

        if (!response.ok) {
            const errorRequest = await response.json();
            throw new Error(errorRequest.message || `Erro ${response.status}: Falha ao adicionar item.`);
        }

        // const data = await response.json();
        items.push(novaFoto);
        localStorage.setItem('fotos', JSON.stringify(items));
        await carregarListaItens();
        await limparInputs();
        exibirMensagem("Item adicionado com sucesso!", "success");
    } catch (error) {
        exibirMensagem(`Erro ao adicionar item: ${error.message}`, "danger");
    }
}

async function carregarListaItens() {
    let items = JSON.parse(localStorage.getItem('fotos'));
    let tabela = document.getElementById('tabelaFotos');
    tabela.innerHTML = "";

    items.forEach(item => {
        const row = `<tr>
                        <td>${item.id}</td>
                        <td>${item.title}</td>
                        <td><img src="${item.url}" width="50"></td>
                        <td>
                            <button class="btn btn-warning btn-sm" title="Editar" onclick="preencherFormularioEdicao(${item.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" title="Excluir" onclick="deletarItemDireto(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>`;
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
            const response = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(fotoAtualizada),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}: Falha ao atualizar item.`);
            }

            items[index] = fotoAtualizada;
            localStorage.setItem('fotos', JSON.stringify(items));
            await carregarListaItens();
            exibirMensagem("Item atualizado com sucesso!", "success");
        } catch (error) {
            exibirMensagem(`Erro ao atualizar item: ${error.message}`, "danger");
        } finally {
            await limparInputs();
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
            const response = await fetch(`https://jsonplaceholder.typicode.com/photos/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}: Falha ao excluir item.`);
            }

            items = items.filter(item => item.id !== id);
            localStorage.setItem('fotos', JSON.stringify(items));
            await carregarListaItens();
            exibirMensagem("Item excluído com sucesso!", "success");
        } catch (error) {
            exibirMensagem(`Erro ao excluir item: ${error.message}`, "danger");
        } finally {
            await limparInputs();
        }
    } else {
        exibirMensagem("Id não encontrado!", "danger");
    }
}

function preencherFormularioEdicao(id) {
    let items = JSON.parse(localStorage.getItem('fotos')) || [];
    let item = items.find(item => item.id === id);

    if (item) {
        document.getElementById('alterarId').value = item.id;
        document.getElementById('tituloAlterar').value = item.title;
        document.getElementById('urlAlterar').value = item.url;
        mostrarSecao('alterar');
    }
}

async function deletarItemDireto(id) {
    let items = JSON.parse(localStorage.getItem('fotos')) || [];
    document.getElementById('deleteId').value = id
    deletarItem();
}

async function getJsonAPI() {
    try {
        // pega as informações da api
        const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=10');

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: Falha ao carregar dados da API.`);
        }

        const fotosWeb = await response.json();
        const localFotos = JSON.parse(localStorage.getItem('fotos')) || [];

        // Se o LocalStorage estiver vazio, usamos os dados da API, caso contrário, mantemos os locais
        const todasFotos = localFotos.length === 0 ? [...fotosWeb] : [...localFotos];

        localStorage.setItem('fotos', JSON.stringify(todasFotos));

        await carregarListaItens();
    } catch (error) {
        exibirMensagem(`Erro ao carregar dados: ${error.message}`, "danger");
    }
}