// Start-Daten anlegen, falls der Speicher komplett leer ist
if (!localStorage.getItem('emails')) {
    localStorage.setItem('emails', JSON.stringify([
        {
            id: 1,
            from: "personB@mail.de",
            to: "personA@mail.de",
            subject: "Willkommen im neuen Design!",
            body: "Hallo Person A,\n\ndas System unterstützt jetzt moderne Schriften, ein freies Adressfeld und passt sich automatisch an deinen Dark Mode an!\n\nViele Grüße,\nPerson B",
            date: new Date().toLocaleString('de-DE')
        }
    ]));
}

let currentUser = "";

// Aktualisiert die gesamte Benutzeroberfläche
function updateUI() {
    currentUser = document.getElementById('userSelect').value;

    // Alle Mails aus dem LocalStorage laden
    const allEmails = JSON.parse(localStorage.getItem('emails')) || [];

    // Mails filtern: Nur an den aktuell ausgewählten Nutzer (Groß-/Kleinschreibung ignorieren)
    const inbox = allEmails.filter(mail => mail.to.toLowerCase().trim() === currentUser.toLowerCase().trim());

    const listContainer = document.getElementById('emailList');
    listContainer.innerHTML = "";

    if (inbox.length === 0) {
        listContainer.innerHTML = '<li class="empty-state">Keine Mails vorhanden.</li>';
        document.getElementById('emailViewer').innerHTML = '<div class="empty-state">Wähle eine E-Mail aus dem Posteingang aus.</div>';
        return;
    }

    // Mails im Posteingang auflisten (Neueste ganz oben)
    inbox.reverse().forEach(mail => {
        const li = document.createElement('li');
        li.className = 'email-item';
        li.onclick = () => viewMail(mail.id, li);
        li.innerHTML = `
            <div class="email-item-header">
                <span>Von: ${escapeHtml(mail.from)}</span>
                <span>${mail.date}</span>
            </div>
            <div class="email-item-subj">${escapeHtml(mail.subject)}</div>
        `;
        listContainer.appendChild(li);
    });
}

// Wechselt das aktive Postfach
function switchUser() {
    document.getElementById('mailForm').reset();
    updateUI();
}

// Speichert eine neu geschriebene E-Mail ab
function sendMail(event) {
    event.preventDefault();

    const to = document.getElementById('mailTo').value;
    const subject = document.getElementById('mailSubject').value;
    const body = document.getElementById('mailBody').value;
    const date = new Date().toLocaleString('de-DE');

    const newEmail = {
        id: Date.now(),
        from: currentUser,
        to: to,
        subject: subject,
        body: body,
        date: date
    };

    const allEmails = JSON.parse(localStorage.getItem('emails')) || [];
    allEmails.push(newEmail);
    localStorage.setItem('emails', JSON.stringify(allEmails));

    // Eingabefelder nach dem Senden leeren
    document.getElementById('mailTo').value = "";
    document.getElementById('mailSubject').value = "";
    document.getElementById('mailBody').value = "";

    alert("E-Mail erfolgreich gesendet!");
    updateUI();
}

// Zeigt die ausgewählte E-Mail im rechten Fenster an
function viewMail(id, element) {
    // Aktive CSS-Klasse in der Liste umschalten
    document.querySelectorAll('.email-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    const allEmails = JSON.parse(localStorage.getItem('emails')) || [];
    const mail = allEmails.find(m => m.id === id);

    if (mail) {
        const viewer = document.getElementById('emailViewer');
        viewer.innerHTML = `
            <div class="viewer-header">
                <h2>${escapeHtml(mail.subject)}</h2>
                <div class="viewer-meta">
                    <strong>Von:</strong> ${escapeHtml(mail.from)}<br>
                    <strong>Datum:</strong> ${mail.date}
                </div>
            </div>
            <div class="viewer-body">${escapeHtml(mail.body)}</div>
        `;
    }
}

// Sicherheits-Funktion gegen Schadcode-Injektionen (XSS Protection)
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Synchronisiert geöffnete Tabs sofort, wenn in einem anderen Fenster gesendet wird
window.addEventListener('storage', (e) => {
    if (e.key === 'emails') updateUI();
});

// System beim Laden der Seite starten
updateUI();
