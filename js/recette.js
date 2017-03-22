window.onload = function() {
    showRecette(TabRecettes, TabSpecRec);
    var searchbox = document.getElementById('query');
    searchbox.addEventListener('click', infos);
    analyse();
}

//fonction de recherche
function analyse() {
    var search = document.getElementById('query');
    if(typeof localStorage != 'undefined'){
      if('query' in localStorage) {
        var query = localStorage.getItem('query');
        search.value = query;
        localStorage.removeItem('query') ;
      }
      else{
        var query = search.value;
        localStorage.setItem('query', query);
      }
    }

    var error = 0; //Erreur dans la recherche (du genre ingrédient > sucre)
    //On sépare la requête en ses différentes parties
    //On commence par les &
    var parts = new Array();
    var subqueries = new Array();

    //Cas du NOT
    if (query.search("NOT") != -1) {
        var prop = query.split("NOT")[1];
        var querywonot = prop.substring(prop.indexOf(')') + 2); //parenthèse fermante + '&'
        var notquery = prop.substring(1, prop.indexOf(')')); //Requête à inverser
        //On inverse la chaîne
        if (notquery.search("=") != -1) {
            if (querywonot.length != 0) {
                query = notquery.replace("=", "#") + '&' + querywonot; //On a inversé la partie concernée par le NOT, on accole le reste s'il existe
            } else {
                query = notquery.replace("=", "#");
            }
        } else if (notquery.search("<") != -1) {
            if (querywonot.length != 0) {
                query = notquery.replace("<", ">") + '&' + querywonot;
            } else {
                query = notquery.replace("<", ">");
            }
        } else if (notquery.search(">") != -1) {
            if (querywonot.length != 0) {
                query = notquery.replace(">", "<") + '&' + querywonot;
            } else {
                query = notquery.replace(">", "<");
            }
        } else if (notquery.search("#") != -1) {
            if (querywonot.length != 0) {
                query = notquery.replace("#", "=") + '&' + querywonot;
            } else {
                query = notquery.replace("#", "=");
            }
        }
    }
    parts = query.split("&");
    //On découpe chaque partie de la requête en sous parties en fonction du séparateur
    for (i = 0; i < parts.length; i++) {
        if (parts[i].search("=") != -1) { //S'il s'agit d'un test d'égalité
            subqueries[i] = parts[i].split("=");
            subqueries[i].push("=");
        } else if (parts[i].search("<") != -1) { //inf
            subqueries[i] = parts[i].split("<");
            subqueries[i].push("<");
        } else if (parts[i].search(">") != -1) { //sup
            subqueries[i] = parts[i].split(">");
            subqueries[i].push(">");
        } else if (parts[i].search("#") != -1) { //différent
            subqueries[i] = parts[i].split("#");
            subqueries[i].push("#");
        } else if (parts[i].search("IE") != -1) { //différent
            subqueries[i] = parts[i].split("IE");
            subqueries[i].push("IE");
        } else if (parts[i].search("SE") != -1) { //différent
            subqueries[i] = parts[i].split("SE");
            subqueries[i].push("SE");
        } else {
            error = 1;
        }
    }

    //Pour chaque recette on vérifie chacune des subqueries
    if (subqueries.length > 0) {
        for (i = 0; i < TabRecettes.length; i++) {
            var canBeDisplayed = true;
            document.getElementById(i).style.display = ""; //Par défaut toutes les recettes sont visibles
            for (j = 0; j < subqueries.length; j++) {
                //On effectue les tests suivants pour chaque ligne de subqueries
                if (subqueries[j][0].search("ingredient") != -1) { //Si on cherche un certain ingrédient
                    if (subqueries[j][2] == '=') {
                        if (document.getElementById(i).textContent.search(subqueries[j][1]) == -1) { //L'ingrédient n'appartient pas à la recette
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == '#') { //Si on ne veut pas d'un certain ingrédient
                        if (document.getElementById(i).textContent.search(subqueries[j][1]) != -1) { //L'ingrédient appartient à la recette
                            canBeDisplayed = false;
                        }
                    } else {
                        error = 1;
                    }
                }
                //Fin test ingrédients
                if (subqueries[j][0].search("difficulte") != -1) { //Si on cherche une certaine difficulte
                    var diff = document.getElementById(i).textContent.split(" : ")[1].split("Catégorie")[0].length; //Nombre d'étoiles de la difficulté de la recette courante
                    if (subqueries[j][2] == '=') {
                        if (diff != subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == '<') {
                        if (diff >= subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == '>') {
                        if (diff <= subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == '#') {
                        if (diff == subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == "IE") {
                        if (diff > subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == "SE") {
                        if (diff < subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    }
                }
                //Fin test difficultés
                if (subqueries[j][0].search("categorie") != -1) { //Si on cherche une certaine catégorie
                    var cat = document.getElementById(i).getElementsByTagName("span")[1].textContent.split(" : ")[1]; //Catégorie de la recette courante
                    if (subqueries[j][2] == '=') {
                        if (cat != subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else if (subqueries[j][2] == '#') {
                        if (cat = subqueries[j][1]) {
                            canBeDisplayed = false;
                        }
                    } else {
                        error = 1; //une catégorie ne peut pas être > ou < à quelque chose
                    }
                }
            }

            if (!(canBeDisplayed)) {
                document.getElementById(i).style.display = "none";
            } else {
                document.getElementById(i).style.display = "";
            }
        }
    } else { //Si la requête est vide, on affiche tout à nouveau
        for (i = 0; i < TabRecettes.length; i++) {
            document.getElementById(i).style.display = "";
        }
    }

    //S'il y'a eu une erreur, on réinitialise la recherche
    if (query.length != 0 & error == 1) {
        alert("Erreur dans la recherche.");
    }

}

function infos() { //Pour le fonctionnement de la searchbox
    confirm("Entrez la recherche SANS ESPACES, SANS ACCENTS, avec la caractéristique voulue au SINGULIER. Utilisez exclusivement des minuscules, sauf pour les opérateurs NOT, IE(inf ou égal) et SE(sup ou égal). Dans le cas du NOT, encadrez la caractéristique et la valeur concernées par des parenthèses.\nExemple de recherche:\n ingredient=laitue&difficulte<3");
    var searchbox = document.getElementById('query');
    searchbox.removeEventListener('click', infos); //Le message d'information n'apparaîtra ainsi qu'une fois
}

//menu
//Qaund on clique sur un menu, l'autre se ferme
function affEntrees() {
    document.getElementById("Entrees").classList.toggle("show");
    document.getElementById("Plats").classList.remove("show");
}

function affPlats() {
    document.getElementById("Plats").classList.toggle("show");
    document.getElementById("Entrees").classList.remove("show");
}

// Ferme le menu si l'utilisateur clique en dehors
window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var d = 0; d < dropdowns.length; d++) {
            var openDropdown = dropdowns[d];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}


//Crée les objets recette sur la page (visibles)
function showRecette(TabRecettes, TabSpecRec) {
    var nb = 0;
    TabRecettes.forEach(function(element) {
        element.insererElements(nb);
        nb = nb + 1;
    })

    //On ajoute également les recettes spécifiques
    for (i = 0; i < TabSpecRec.length; i++) {
        TabSpecRec[i].insererElements(i);
    }

    //Et on les cache
    hideSpecificRecipes();
}

//Cache toutes les recettes spécifiques
function hideSpecificRecipes() {
    for (i = 0; i < TabSpecRec.length; i++) {
        document.getElementById("SpecificRecipes").getElementsByTagName("article")[i].style.display = "none";
    }
}

//Quand on clique sur accueil, on cache les recettes spécifiques et on affiche la liste des recettes
function accueil() {
    document.getElementById("recettes").style.display = "";
    hideSpecificRecipes();
}

//Active la recette passée en paramètre et fait disparaître le reste
function showSpecific(id) {
    document.getElementById("recettes").style.display = "none"; //On cache les recettes

    //On cache toutes les recettes spécifiques
    hideSpecificRecipes();
    //On affiche uniquement celle concernée
    document.getElementById("SpecificRecipes").getElementsByTagName("article")[id].style.display = ""; //On affiche la recette spécifique correspondante
}

//Structure de recette
var recette = function(nom, img, cat, dif, ingr) {

    //on définit les attributs de la classe recette
    this.nom = nom;
    this.image = img;
    this.categorie = cat;
    this.difficulte = dif;
    this.ingredients = ingr;


    //Création de la recette
    this.insererElements = function(id) {
        //On r�cup�re les balises entre lesquelles ins�rer les �l�ments
        var recettes = document.getElementById("recettes");

        var section = document.createElement("section");
        section.setAttribute("class", "gauche");
        section.setAttribute("id", id);
        recettes.appendChild(section);

        //afficher le contenu
        var titre = document.createElement("h3");
        titre.innerHTML = this.nom;
        section.appendChild(titre);
        //image
        var img = document.createElement("img");
        img.setAttribute("src", this.image);
        img.setAttribute("onClick", "showSpecific(" + id + ")");
        section.appendChild(img);
        //difficult�
        var dif = document.createElement("span");
        dif.innerHTML = "Difficulté : " + this.difficulte;
        section.appendChild(dif);
        //catégorie
        var cat = document.createElement("span");
        cat.innerHTML = "Catégorie : " + this.categorie;
        section.appendChild(cat);

        //tableau des ingrédients
        var ingr = document.createElement("span");
        section.appendChild(ingr);
        var p = document.createElement("p");
        ingr.appendChild(p);
        p.innerHTML = "Ingrédients:";
        var ul = document.createElement("ul");
        ingr.appendChild(ul);

        i = 0;
        for (i = 0; i < this.ingredients.length; i++) {
            var li = document.createElement("li");
            ul.appendChild(li);
            li.appendChild(document.createTextNode(this.ingredients[i])); //on ajoute un text node pour pouvoir afficher le contenu d'une case
        }
    }
}

//Structure de recette spécifique
var SpecRec = function(recette, cout, tmp, note, todo) {
    this.nom = recette.nom;
    this.image = recette.image;
    this.categorie = recette.categorie;
    this.difficulte = recette.difficulte;
    this.ingredients = recette.ingredients;
    this.cout = cout;
    this.temps = tmp;
    this.todo = todo;
    this.note = note;

    //Création de la recette spécifique dans le corps de la page
    this.insererElements = function(id) {
        //On récupère la balise à partir de laquelle on va ajouter les éléments
        var SpecificRecipes = document.getElementById("SpecificRecipes");

        var article = document.createElement("article");
        SpecificRecipes.appendChild(article);
        var header = document.createElement("header");
        article.appendChild(header);
        //titre de la recette
        var h1 = document.createElement("h1");
        h1.innerHTML = this.nom;
        header.appendChild(h1);
        //contenu de la recette
        var sectionRecette = document.createElement("section"); //Section qui contiendra la procédure de la recette
        var contentSection = document.createElement("section"); //Section qui contient l'ensemble des éléments de la recette
        sectionRecette.appendChild(contentSection);

        article.appendChild(sectionRecette);

        //image
        var img = document.createElement("img");
        img.setAttribute("src", this.image);
        contentSection.appendChild(img);
        var ul = document.createElement("ul");
        contentSection.appendChild(ul);

        //difficulte
        var li = document.createElement("li");
        li.innerHTML = "Difficulte : " + this.difficulte;
        //li.appendChild(this.difficulte);
        ul.appendChild(li);

        //temps de préparation
        li = document.createElement("li");
        li.innerHTML = "Temps de préparation : " + this.temps;
        ul.appendChild(li);

        //coût
        li = document.createElement("li");
        li.innerHTML = "Coût : " + this.cout;
        ul.appendChild(li);

        //catégorie
        li = document.createElement("li");
        li.innerHTML = "Catégorie : " + this.categorie;
        ul.appendChild(li);

        //Note
        li = document.createElement("li");
        li.innerHTML = "Note : " + this.note;
        ul.appendChild(li);

        //Recette
        var p = document.createElement("p");
        p.innerHTML = this.todo;
        sectionRecette.appendChild(p);
    }
}

/**************************************************************************************************************************************************/
// STRUCTURE DE DONNEES
var rc1 = new recette("Saute de porc", "http://pendacuisine.com/images/plats/Autres/steak%20de%20viande%20-%20autres.jpg", "plat de resistance", "***", ['steak hache', 'pommes de terre', 'tomates', 'laitue']);
var rc2 = new recette("Foie en sauce", "http://www.evasion-culinaire.com/wp-content/uploads/2014/07/kebda-mchermla.jpg", "plat de resistance", "***", ['foie d\'agneau', 'persil', 'coriandre', 'huile d\'olive']);
var rc3 = new recette("Salade variée", "http://www.1zoom.me/big2/702/315792-svetik.jpg", "entree", "**", ['laitue', 'chou', 'saucisses', 'pommes de terre']);
var rc4 = new recette("Salade végétarienne", "http://www.1zoom.me/big2/392/300825-svetik.jpg", "entree", "*", ['laitue', 'tomates', 'olives', 'pommes de terre']);
var rc5 = new recette("Forêt noire", "https://files.meilleurduchef.com/mdc/photo/recette/foret-noire/foret-noire-2-640.jpg", "dessert", "***", ['creme', 'chocolat noir', 'cerises', 'oeufs']);
var rc6 = new recette("Tarte aux myrtilles", "http://patisserie.dumontweb.com/recettes/tarte-myrtilles-big.jpg", "dessert", "*", ['pate sablee', 'myrtilles', 'sucre']);

var TabRecettes = new Array(rc1, rc2, rc3, rc4, rc5, rc6);

//On crée les 2 recettes spécifiques
var src1 = new SpecRec(rc1, "luxueux", "25 min", "*****", "Faire revenir l'oignon haché dans un peu d'huile d'olive, rajouter la viande hachée (encore surgelée ce n'est pas gênant) et la sauce bolognaise. Saler, poivrer et rajouter des herbes à votre goût. Ecraser un peu la viande à la cuillère en bois si elle forme un bloc trop compact.")
var src2 = new SpecRec(rc2, "bon marché", "15 min", "***", "Faire chauffer l'huile, faites-y revenir à feu vif les dés de foie avec l'ail écrasé. Ajoutez le piment, les tomates, les épices, faites cuire 10 min à feu doux. Arrosez de vinaigre, parsemez de coriandre. Servez sans attendre accompagné de pain maison.")

var TabSpecRec = new Array(src1, src2);
