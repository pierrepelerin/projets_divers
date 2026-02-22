<?php

echo'<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <style>
        html{
            font-family: Consolas, "Courier New", monospace;
        }
        input{
            width: 30px;
            height: 30px;
            border: 0;
            padding: 0;
            border: solid 1px #5A30DF;
            text-align: center;
            font-weight: bold;
            color: #5A30DF;
        }
        button{
            margin-top: 20px;
            font-weight: bold;
            color: #5A30DF;
            border: solid 1px #5A30DF;
        }
        h1{
            color: #5A30DF;
            font-size: 1.5em;
        }
        .carte{
            border: solid 2px #5A30DF;
            width: 800px;
            margin: 20px;
            padding: 20px;
            box-shadow: 30px 30px 120px #5A30DF;
        main{
            display: flex;
            gap: 50px;
        }

    </style>
</head>
<body>
<div class="carte">
    <h1>Résolution de Sudoku - PHP</h1>
    <main>';

//AfficherGrille($Grille);

//Fonction pour afficher la grille
function AfficherGrille(array $Grille): void{ //Void : ne revoie rien
    for ($i = 0; $i < 9; $i++) {
        if ($i % 3 === 0 && $i != 0) {
            echo "------+-------+------<br>";
        }
        for ($j = 0; $j < 9; $j++) {
            if ($j %3 === 0 && $j != 0) {
                echo "| ";
            }
            $Chiffre = $Grille[$i][$j];
            echo (($Chiffre === 0) ? "." : $Chiffre) . " "; //Affiche un "." si le chiffre est zéro (pas de chiffre)
        }
        echo "<br />";
    }
}

//Trouve une case vide
function TrouveVide(array $Grille): ?array {
    for($i = 0; $i < 9; $i++) {
        for ($j =0; $j<9; $j++){
            if ($Grille[$i][$j] === 0) return [$i, $j]; //Return arrête la fonction et renvoie un tableau concernant la position
        }
    }
    return null; // Si aucun "0" trouvé, on renvoie "null"
}

//Regarde si un nombre est valide
function Valide(array $Grille, int $Ligne, int $Colonne, int $ChiffreATester): bool {
    //Ligne
    for ($i = 0; $i < 9; $i++){
        if ($Grille[$Ligne][$i] === $ChiffreATester) return false;
    }
    //Colonne
    for ($j = 0; $j < 9; $j++){
        if ($Grille[$j][$Colonne] === $ChiffreATester) return false;
    }
    //Bloc 3x3
    $StartLigne = intdiv($Ligne, 3) * 3;
    $StartColonne = intdiv($Colonne, 3) * 3;
    for ($i = $StartLigne; $i < $StartLigne +3 ; $i++){
        for ($j = $StartColonne; $j < $StartColonne +3 ; $j++){
            if ($Grille[$i][$j] === $ChiffreATester) return false;
        }
    }
    return true;
}

//Résolution de la grille
function Resolution(array &$Grille) : bool { //"&" permet de travailler directement sur l'original et pas une copie
    $Vide = TrouveVide($Grille);
    if ($Vide === null) return true; //Terminé

    [$Ligne,$Colonne] = $Vide;

    for($n = 1; $n <= 9; $n++) {
        if (Valide($Grille, $Ligne, $Colonne, $n)) {
            $Grille[$Ligne][$Colonne] = $n;
            if (Resolution($Grille)) return true;
            // échec -> backtrack
            $Grille[$Ligne][$Colonne] = 0;
        }
    }
    return false; // aucun chiffre possible ici
}

$Grille = null;

//POSITION DE DEPART
//******************

//AFFICHER LA GRILLE POUR ENTRER LES CHIFFRES
echo'<form method="post"><div>';
$index = 1; //Numéro de la case
for ($i = 0; $i < 9; $i++) {
    for ($j = 0; $j < 9; $j++) {
        $val = $_POST[$index] ?? ""; //Si pas de valeur, mettre une chaine vide
        echo '<input type="text" name="'.$index.'" id="'.$index.'" value="'.htmlspecialchars($val).'" maxlength="1">';
        $index++;
    }
    echo '<br>';
}

echo '<button type="submit">Résolution</button></form><br/><br /></div><div>';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    for ($i = 0; $i < 9; $i++) {
        $Grille[$i] = [];
        for ($j = 0; $j < 9; $j++) {
            $index = $i * 9 + $j + 1;
            $val = $_POST[(string)$index] ?? '';
            if($val == "") {
                $Grille[$i][$j] = 0;
            } else {
                $Grille[$i][$j] = (int)$val;
            }
        }
    }

    //AfficherGrille($Grille);
    $GrilleDepart = $Grille;

    if (Resolution($Grille)) {
    } else {
    echo "Aucune solution.<br>";
    }

for ($i = 0 ; $i < 9 ; $i++){
    for ($j = 0 ; $j < 9 ; $j++) {
        echo'<input type="text" value="' . $Grille[$i][$j] . '">';
    }
    echo '<br />';
}

}
echo'</div></div></main>
</body>
</html>';

?>