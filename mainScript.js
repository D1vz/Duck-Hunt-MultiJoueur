// Inits
window.onload = function init() {
  var game = new GF();
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext('2d');
  
  // Les écouteurs

  game.start();
};

function traiteMouseDown(evt) {
  //console.log("mousedown");
}

function traiteMouseMove(evt) {
  //console.log("mousemove");
  //console.log("dans le traiteMouseMove : utilisateur = "+username);
  mousePos = getMousePos(evt);
  //console.log(mousePos.x + " " + mousePos.y); 
  if(username != undefined ) {
    allPlayers[username].x = mousePos.x;
    allPlayers[username].y = mousePos.y; 
  }
  //console.log("On envoie sendPos");
  var pos = {'user':username, 'pos':mousePos}
  //console.log(mousePos);
  socket.emit('sendpos', pos);
}

function initListeners(){
  canvas = document.querySelector("#myCanvas");
  ctx = canvas.getContext('2d');
  canvas.addEventListener("mousedown", traiteMouseDown);
  canvas.addEventListener("mousemove", traiteMouseMove);
}

function updatePlayerNewPos(newPos) {
  allPlayers[newPos.user].x = newPos.pos.x;
  allPlayers[newPos.user].y = newPos.pos.y;
}
// Mise à jour du tableau quand un joueur arrive
// ou se deconnecte
function updatePlayers(listOfPlayers) {
  allPlayers = listOfPlayers;
}

function drawPlayer(player) {
  if (inputStates.space) {
    displayMenu=4;
  }
  if(level!=0 && displayMenu!=1)
  {
    ctx.save();
    ctx.beginPath();
    ctx.translate(player.x-12, player.y-12)
    if(player.numPlayer==2)
    {
      spriteDuck[32].renderMoving(0,0, 1);
    }
    else
    {
      console.log(player.numPlayer);
      spriteDuck[14].renderMoving(0,0, 1);
    }
    /*player.color = "black";
    player.r = 8
    ctx.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();*/
    ctx.restore();
  }
  else
  {
    ctx.save();
    ctx.beginPath();
    ctx.translate(player.x-12, player.y-12)
    if(player.numPlayer==2)
    {
      spriteDuck[32].renderMoving(0,0, 1);
    }
    else
    {
      console.log(player.numPlayer);
      spriteDuck[14].renderMoving(0,0, 1);
    }
    /*player.r = 5;
    player.color = "red";
    ctx.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();*/
    ctx.restore();
  }
}

function drawAllPlayers() {
  //var length=0;
  for(var name in allPlayers) {
    //length++;
    //console.log(name);
    //console.log(name+" : "+allPlayers[name].x, allPlayers[name].y);
    drawPlayer(allPlayers[name]);
  }
  //console.log(length);
}

function updateGame(lvl,deads,isLost,menu, starting){
  //console.log("isStart = "+isStart);
  //console.log("dans le updateGame, pour l'utilisateur "+username+" level = "+level+" countDeads = "+countDeads+" lost  = "+lost+" menu  = "+displayMenu+" isStart = "+isStart);
  //console.log("dans le updateGame, pour l'utilisateur "+username+" lvl recu = "+lvl+" countDeads recu = "+deads+" isLost recu = "+isLost+" menu recu = "+menu);
  if(level!=lvl)
  {
    if(lvl>level){
      //console.log("dans le updateGame, pour l'utilisateur "+username+" on change le lvl ("+level+") en "+lvl);
      level=lvl;
    }
  }
  if(menu!=displayMenu)
  {
    displayMenu = menu;
  }
  if(countDeads!=deads)
  {
    if(deads>countDeads)
    {
      countDeads=deads;
    }
  }
  if(lost!=isLost)
    lost=isLost;
  if(isStart!=starting)
    isStart = starting;
}

function updateDucks(duckShot, duckHP, duckIsDead){
  console.log("dans le updateDucks : "+duckShot+" hp="+duckHP+" isDead="+duckIsDead);
  console.log("duck touché num = "+duckShot+"hp = "+ tabMonstres[duckShot].hp + " isdead = "+tabMonstres[duckShot].isDead);
  if(tabMonstres[duckShot].hp != duckHP)
    tabMonstres[duckShot].hp = duckHP;
  if(tabMonstres[duckShot].isDead != duckIsDead)
    tabMonstres[duckShot].isDead = duckIsDead;
}

function startGame(lvl, starting,menu,deads)
{
  level = lvl;
  isStart = starting;
  displayMenu = menu;
  countDeads = deads;
}

// GAME FRAMEWORK isStartS HERE
var GF = function() {

    var player = {
      x: 10,
      y: 10,
      r: 10,
      v: 5,
      color: 'black',
      ammo:10,
      draw: function() {
        if(level!=0 && displayMenu!=1)
        {

          ctx.save();
          ctx.beginPath();
          ctx.translate(player.x-12, player.y-12)
          spriteDuck[14].renderMoving(0,0, 1);
          /*player.color = "black";
          player.r = 8
          ctx.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
          ctx.fillStyle = player.color;
          ctx.fill();*/
          ctx.restore();
        }
        else
        {
          ctx.save();
          ctx.beginPath();
          ctx.translate(player.x-12, player.y-12)
          spriteDuck[14].renderMoving(0,0, 1);
          /*player.r = 5;
          player.color = "red";
          ctx.arc(player.x, player.y, player.r, 0, 2 * Math.PI);
          ctx.fillStyle = player.color;
          ctx.fill();*/
          ctx.restore();
        }
      }
    };



  /////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////// MAIN ///////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////

    var mainLoop = function(time) {
      //main function, called each frame 
      measureFPS(time);
      if(displaySound==1)
        music.unmute();
      else
      {
        music.mute();
      }
      // Clear the canvas
      if(username != undefined ) {
        clearCanvas();
      }
      generateLvL();
      applyListeners();
      displayCurrentMenu();
      displayAmmosAndLevel();
      // draw the monster
      dessinerLesMonstres();
      //console.log("taille du tableau de monstres : "+tabMonstres.length);
      mouseDown();
      //player.draw();

      if(username != undefined ) {
        drawAllPlayers();
      }
      //envoyer l'état du jeu à tous les utilisateurs
      //menu de fin de niveau
      if (isLevelDone()&&level!=0) {

        if(displayMenu!=1)
        {

          //console.log("level done");
          isStart=false;
          if(level==10)
            displayMenu=3;
          else
            displayMenu=1;
          countDeads=0;
          socket.emit('sendgame', username,level,countDeads,lost,displayMenu,isStart);
        }
      }
      

      //ctx.fillText("x : " + player.x+" y : "+player.y, 300, 300);

      //console.log(cooldown);
      //console.log("displaySound-main = "+displaySound);
      requestAnimationFrame(mainLoop);
    };


  var start = function() {
    // adds a div for displaying the fps value
    fpsContainer = document.createElement('div');
    document.body.appendChild(fpsContainer);
    spritesheet = new Image();
    //console.log("ok");
    //spritesheet.src="http://i.imgur.com/3VesWqx.png";
    spritesheet.onload = function() {
      //console.log("chargement de l'image");
      // info about spritesheet
      var SPRITE_WIDTH = 42;
      var SPRITE_HEIGHT = 42;
      var NB_DIRECTIONS = 1;
      var NB_FRAMES_PER_POSTURE = 3;
      initSpritesDuck(spritesheet, SPRITE_WIDTH, SPRITE_HEIGHT, 
       NB_DIRECTIONS, NB_FRAMES_PER_POSTURE);
      // Canvas, context etc.
      canvas = document.querySelector("#myCanvas");
      // often useful
      w = canvas.width;
      h = canvas.height;
      // important, we will draw with this object
      ctx = canvas.getContext('2d');

      addKeyListeners();
      // isStart the animation
      requestAnimationFrame(mainLoop);
      setInterval(setCooldown,400);
    }
    spritesheet.src="Duck_sprites2.png";
  };

  //our GameFramework returns a public API visible from outside its scope
  return {
    start: start
  };
};