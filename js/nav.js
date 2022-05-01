const navHTML = `
        <input class="menu-icon" type="checkbox" id="menu-icon" name="menu-icon">
        <label for="menu-icon"></label>

        <div class="overlay">
            <a href="./index.html">ACCUEIL</a>
            <a href="./character.html">PERSONNAGES</a>
            <a href="./quizz.html">QUIZZ</a>
            <a href="./shorter.html">RÉSUMÉ</a>
            <a href="./success.html">SUCCÈS</a>
            <a href="./contact.html">CONTACT</a>
        </div>
        `

const nav = document.createElement('div')
nav.className = 'nav'
nav.innerHTML = navHTML

document.body.appendChild(nav);

document.head.innerHTML += '<link rel="stylesheet" href="../css/nav.css">'