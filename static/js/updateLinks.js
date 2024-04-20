//This script is to dynamically load my link table so I only have to update one place with new links

//Define HTML element
const links = document.getElementById('linkList');
const mblLinks = document.getElementById('linkListMbl');

//Set the String for each page
let html = "";

html += '<li><a href="./index.html">Resume</a></li>';
html += '<li><a href="./3T.html">Tic-Tac-Toe</a></li>';
html += '<li><a href="./blackjack.html">Black Jack</a></li>';

//add the list items to the linkList
links.innerHTML = html;
mblLinks.innerHTML = html;
