const loadFilms = () => {
    fetch('http://localhost:3000/films')
        .then(response => response.json())
        .then(films => {
            const filmsList = document.getElementById('films');
            filmsList.innerHTML = ''; 

            films.forEach(film => {
                const listItem = document.createElement('li');
                listItem.className = 'film item';
                listItem.textContent = film.title;

                const removeButton = document.createElement('button');
                removeButton.textContent = 'Delete';
                removeButton.className = 'ui red button';
                removeButton.addEventListener('click', event => {
                    event.stopPropagation(); 
                    event.preventDefault();
                    removeFilm(film.id, listItem);
                });
                listItem.appendChild(removeButton);

                listItem.addEventListener('click', () => showFilmDetails(film));
                filmsList.appendChild(listItem);
            });

            if (films.length > 0) {
                showFilmDetails(films[0]); // Show the first film's details initially
            }
        });
};

const removeFilm = (id, listItem) => {
    fetch(`http://localhost:3000/films/${id}`, {
        method: 'DELETE',
    }).then(() => {
        listItem.remove(); 
        loadFilms(); 
    });
};

const showFilmDetails = film => {
    const title = document.getElementById('title');
    const runtime = document.getElementById('runtime');
    const filmInfo = document.getElementById('film-info');
    const showtime = document.getElementById('showtime');
    const ticketNum = document.getElementById('ticket-num');
    const poster = document.getElementById('poster');
    const buyTicketButton = document.getElementById('buy-ticket');

    title.textContent = film.title;
    runtime.textContent = `${film.runtime} minutes`;
    filmInfo.textContent = film.description;
    showtime.textContent = film.showtime;
    poster.src = film.poster;

    const availableTickets = film.capacity - film.tickets_sold;
    ticketNum.textContent = availableTickets;

    if (availableTickets <= 0) {
        buyTicketButton.textContent = 'Sold Out';
        buyTicketButton.disabled = true; 
        document.querySelector(`li:contains('${film.title}')`).classList.add('sold-out');
    } else {
        buyTicketButton.textContent = 'Buy Ticket';
        buyTicketButton.disabled = false;
        buyTicketButton.onclick = event => {
            event.preventDefault();
            purchaseTicket(film);
        };
    }
};

const purchaseTicket = film => {
    const availableTickets = film.capacity - film.tickets_sold;

    if (availableTickets > 0) {
        fetch(`http://localhost:3000/films/${film.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tickets_sold: film.tickets_sold + 1 }),
        })
        .then(response => response.json())
        .then(updatedFilm => {
            showFilmDetails(updatedFilm); // Update the displayed film details
            recordTicketPurchase(updatedFilm.id);
        });
    }
};

const recordTicketPurchase = filmId => {
    fetch(`http://localhost:3000/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ film_id: filmId, number_of_tickets: 1 }),
    });
};

document.addEventListener('DOMContentLoaded', loadFilms);
