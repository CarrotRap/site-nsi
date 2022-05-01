var db = [{"question":"Quel est le nom de Michael ?","responses":["Scotviel","Scotpield","Scotfield"],"response":2},{"question":"Que fait Michael pour être emprisonné ?","responses":["Il braque un bureu de poste","Il braque une bijouterie","Il braque une banque"],"response":2},{"question":"Quel est le nom de l'acteur jouant Michael ?","responses":["Wentwork Willer","Wentworth Miller","Wenworth Piller"],"response":1},{"question":"Comment s'appelle la prison ?","responses":["Prison Break","Fox Biver","Fox River"],"response":2},{"question":"Qui est Lincoln ?","responses":["Le frère de Michael","Le beau-frère de Michael","Le cousin de Michael"],"response":0},{"question":"Lincoln a eu une relation avec","responses":["Véronique","Véronica","Sara"],"response":1},{"question":"Quel est le grade de Bellick ?","responses":["Capitaine","Lieutenant","Commandant"],"response":0},{"question":"Quel est le Prénom de Bellick ?","responses":["Pat","Zack","Brad"],"response":2},{"question":"Que construit Michael pour le directeur de la prison ?","responses":["Un tajmahal","Un bajmahal","Un pagmahal"],"response":0},{"question":"Quel est le prénom de l'agent Kellerman ?","responses":["Hale","Ralph","Paul"],"response":2},{"question":"Qui est le compagnon de cellule de Charles Westmoreland ?","responses":["Un oiseau","Un chat","Un poisson"],"response":1},{"question":"Qui a créé la série ?","responses":["Paul Sheuring","Steven Spielberg","Faf Larage"],"response":0},{"question":"Le tatouage de Michael est...","responses":["Vrai","Faux","Peut-être"],"response":0},{"question":"Que fabrique Michael ?","responses":["Des cignes en papier","Des avions en papier","Des bateaux en papier"],"response":0},{"question":"Charles Westmoreland a pris en otage :","responses":["Un 827","Un 927","Un 727"],"response":1},{"question":"Quel est le titre français du générique ?","responses":["Pas le temps de s'aimer","Pas le temps de traîner","Pas le temps de s'évader"],"response":1},{"question":"Théodore Bagwell est surnommé...","responses":["Ti-Bag","T-Bag","Te-bag"],"response":1},{"question":"Abruzzi a mis un contrat sur :","responses":["Vibonacci","Libonacci","Fibonacci"],"response":2},{"question":"Comment s'appelle le cousin de Sucre ?","responses":["Victor","Doctor","Hector"],"response":2},{"question":"Lj-Burrows a été arrêté pour :","responses":["Possession d'armes","Possession de marijuana","Possession de cocaïne"],"response":1},{"question":"Le docteur Tancredi a fait :","responses":["Un infarctus","Une overdose","Une embolie"],"response":1},{"question":"Quel est le prénom de l'agent Mahone ?","responses":["Alex","Alexander","Alexandre"],"response":1},{"question":"Combien de detenus se sont échappés ?","responses":["6","5","8"],"response":2},{"question":"Quel est le prénom de Steadman ?","responses":["Laurence","Terrence","Florence"],"response":1},{"question":"Qu'y a-t-il dans le stylo de Mahone ?","responses":["De l'encre","Un message","Une pillule"],"response":2},{"question":"Sur le poignet de Michael, on voit écrit...","responses":["Ripe chance Woods","Ripe chance Blood","Ripe chance Dood"],"response":0},{"question":"Qui a tatoué Michael ?","responses":["Saïd","Sid","Syd"],"response":2},{"question":"Les fuyards se dirigent vers...","responses":["Oslo","Oswego","Osbone"],"response":1}]
const numberOfQuestion = 5

const questions         = document.querySelector('.question');
const validButton       = document.querySelector('.valid');
const restartButton     = document.querySelector('.restart');
const endLabel          = document.querySelector('.end');

/* On récupère le model écrit en HTML pour pouvoir le replacer avec les questions dans la fonction addQuestion */
const questionModel = questions.innerHTML;
questions.innerHTML = "";

function addQuestion(id, question, answers, response) {
    var str = questionModel;
    str = str.replace('{ question }', question)
    str = str.replace('{ answer1 }', answers[0])
    str = str.replace('{ answer2 }', answers[1])
    str = str.replace('{ answer3 }', answers[2])
    str = str.replace('{ indexResponse }', response)
    str = str.replaceAll('{ id }', id)
    questions.innerHTML += str
}

/* Mélange de la base de donnée puis on ajoute le nombre de question numberOfQuestion */
db = db.sort(function(){ return Math.random()-0.5; })
for(var i = 0; i < numberOfQuestion; i++) {
    addQuestion(i, db[i].question, db[i].responses, db[i].response)
}

/* Evenement lié à la validation de l'utilisateur */
validButton.addEventListener('click', () => {
    var resTrue = 0

    /* On récupère les éléments qui sont les bonnes réponses puis on leur ajoute une couleur */
    for(var i = 0; i < numberOfQuestion; i++) {
        const item = document.getElementById(i + '_' + (db[i].response + 1))

        if(item.checked) resTrue += 1

        item.setAttribute('style', '--color: #6BCB77;')
    }

    /* On donne le résultat de l'utilisateur */
    endLabel.innerHTML = resTrue + '/' + numberOfQuestion
});

restartButton.addEventListener('click', () => {
    window.location.reload()
})