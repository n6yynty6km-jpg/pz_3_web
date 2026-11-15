document.addEventListener('DOMContentLoaded', function() {
    const commentInput = document.getElementById('commentInput');
    const addCommentBtn = document.getElementById('addCommentBtn');
    const commentsList = document.getElementById('commentsList');
    const API_URL = '/api/comments';

    // Загрузка комментариев
    async function loadComments() {
        try {
            const response = await fetch(API_URL);
            const comments = await response.json();
            commentsList.innerHTML = '';
            comments.forEach(comment => createCommentElement(comment));
        } catch (e) {
            console.error('Ошибка загрузки:', e);
        }
    }

    // Создание элемента
    function createCommentElement(comment) {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.dataset.id = comment.id;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = comment.date;

        const textP = document.createElement('p');
        textP.textContent = comment.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Удалить';
        deleteBtn.onclick = async function() {
            if (!confirm('Удалить комментарий?')) return;
            try {
                const resp = await fetch(`${API_URL}/${comment.id}`, { method: 'DELETE' });
                if (resp.ok) div.remove();
                else alert('Ошибка удаления');
            } catch (e) { alert('Сервер недоступен'); }
        };

        div.appendChild(dateSpan);
        div.appendChild(deleteBtn);
        div.appendChild(textP);
        commentsList.prepend(div);
    }

    // Добавление комментария
    addCommentBtn.addEventListener('click', async function() {
        const text = commentInput.value.trim();
        if (!text) { alert('Введите текст!'); return; }

        const newComment = {
            text: text,
            date: new Date().toLocaleString('ru-RU')
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            if (response.ok) {
                const saved = await response.json();
                createCommentElement(saved);
                commentInput.value = '';
            } else {
                alert('Ошибка на сервере');
            }
        } catch (e) {
            alert('Не удалось связаться с сервером.');
        }
    });

    loadComments();
});