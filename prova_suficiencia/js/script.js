document.addEventListener("DOMContentLoaded", () => {
    getJsonWeb(); // Carrega os dados ao iniciar
});

function showSection(sectionId) {
    document.getElementById('insert').classList.add('d-none');
    document.getElementById('list').classList.add('d-none');
    document.getElementById('delete').classList.add('d-none');

    // exibi a escolhida
    document.getElementById(sectionId).classList.remove('d-none');

    // Atualiza a classe 'active' no menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Ativa o link clicado
    event.currentTarget.classList.add('active');
}

async function addItem() {
    let title = document.getElementById('title').value;
    let url = document.getElementById('url').value;

    const newPhoto = {
        title: title,
        url: url,
        thumbnailUrl: url
    };

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/photos', {
            method: 'POST',
            body: JSON.stringify(newPhoto),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();
        let items = JSON.parse(localStorage.getItem('photos'));
        items.push({ data });
        localStorage.setItem('photos', JSON.stringify(items));
        alert('Item adicionado!');
        console.log("Novo item adicionado:", data);
        alert("Item adicionado com sucesso!");
    } catch (error) {
        alert("ERRO AO ADICIONAR NOVO ELEMENTO")
    }
    console.log(localStorage.getItem('photos'))
}

async function loadPhotos() {
    let items = JSON.parse(localStorage.getItem('photos'));
    let table = document.getElementById('photoTable');
    table.innerHTML = "";

    items.forEach(item => {
        const row = `<tr><td>${item.id}</td><td>${item.title}</td><td><img src="${item.url}" width="50"></td></tr>`;
        table.innerHTML += row;
    });
}

function deleteItem() {
    let id = document.getElementById('deleteId').value;
    let items = JSON.parse(localStorage.getItem('photos')) || [];
    items = items.filter(item => item.id != id);
    localStorage.setItem('photos', JSON.stringify(items));
    alert('Item excluído!');
}

async function getJsonWeb() {
    // pega as informações da api
    const response = await fetch('https://jsonplaceholder.typicode.com/photos?_limit=10');
    const photos = await response.json();

    // console.log(photos)

    localStorage.setItem('photos', JSON.stringify(photos))
}