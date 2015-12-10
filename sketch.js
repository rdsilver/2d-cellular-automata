var grid;
var cube_size = 15;
var states = 2;

function setup() {
  var myCanvas = createCanvas(window.innerWidth, window.innerHeight - 100);
  myCanvas.parent('sketch');

  grid = new Grid();
  noStroke();
  smooth();
}

function draw() {
  grid.step();
  update_info();

  if (mouseIsPressed) 
    turnCellOn();
}

// Grid Class
function Grid() {
  this.size = cube_size;
  this.x = Math.round(width/this.size);
  this.y = Math.round(height/this.size);
  this.grid = set2dArrayToZero(createArray(this.x, this.y));
  this.temp_grid = set2dArrayToZero(createArray(this.x, this.y));
  this.steps = 0;
  this.cells_alive = 0;

  // Optionally turn on middle cell
  this.grid[Math.round(this.x/2)][Math.round(this.y/2)] = 1;

  this.step = function() {
    this.temp_grid = createArray(this.x, this.y);
    this.cells_alive = 0;
    // Loop through the 2d array and match the interger result of the neighbors to find the rule
    // Since drawing takes a long time, don't redraw if the cell state doesn't change
    for (x=0; x<this.x; x++) 
      for (y=0; y<this.y; y++) {

        result = '';
        for (z=0; z<neighborhood.length; z++) {
          a = neighborhood[z][0];
          b = neighborhood[z][1];
          if (x + a >= 0 && x + a < this.x && y + b >= 0 && y + b < this.y)
            result += this.grid[x+a][y+b];
          else
            result += 0;
        }

        current = this.grid[x][y];
        this.temp_grid[x][y] = ruleset.rule[parseInt(result, states)];

        //Count alive cells
        if (this.temp_grid[x][y] == 1)
          this.cells_alive +=1;

        // Take care of the drawing here
        if (current != this.temp_grid[x][y] || this.steps == 0) {
          if (this.temp_grid[x][y] == 0 ) {
            fill(58, 71, 80);
            rect(x*this.size, y*this.size, this.size, this.size);
          }
          else {
            fill(33, 133, 213);
            rect(x*this.size, y*this.size, this.size, this.size);
          }
        }

      }//End 2d array looping 

    this.grid = this.temp_grid;
    this.steps++;
  }
}; //End of class grid

function RuleSet() {
  this.rule = [];

  this.newRules = function() {
    this.rule = [];
    for (x=0; x<rule_size; x++)
      this.rule.push(Math.round(Math.random() * (states-1)));

    // To get rid of on and off flashing we have to make sure the first and last digit are not the opposite
    // This gets rid of 1/4 of the rules BUT people won't have seizures 
     if(this.rule[0] == 1 && this.rule[rule_size-1] == 0) {
       this.newRules();
     }
  }
}

function update_info() {
  document.getElementById('generations').innerHTML = "Generations : " + grid.steps;

  var cells_p_alive = ((grid.cells_alive/(grid.x * grid.y)) * 100).toFixed(2);
  document.getElementById('cells_alive').innerHTML = "% Cells Alive : " + cells_p_alive;
  document.getElementById('cells_dead').innerHTML = "% Cells Dead : " + (100 - cells_p_alive).toFixed(2);
}

function set2dArrayToZero(array) {
  for (x=0; x<array.length; x++) 
      for (y=0; y<array[x].length; y++) 
        array[x][y] = 0;

  return array;
}

function set2dArrayRandom(array) {
  for (x=0; x<array.length; x++) 
      for (y=0; y<array[x].length; y++) 
         array[x][y] = Math.round(Math.random() * (states-1));

  return array;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

/* Not being used, but good reference
function sortNeighbors(a, b) {
  if (a[1] < b[1])
    return -1;
  if (a[1] == b[1])
    if (a[0] < b[0])
      return -1;
  return 1;
} */

function mouseClicked() {
  turnCellOn();
}

function mouseDragged() {
  turnCellOn();
}

function mousePressed() {
  turnCellOn();
}

function windowResized() {
  resizeSketch();
}

function resizeSketch() {
  resizeCanvas(window.innerWidth, window.innerHeight - 100);
  grid = new Grid();
}

function turnCellOn() {
    var x = Math.round(mouseX/cube_size);
    var y = Math.round(mouseY/cube_size);

    if (x >= 0 && x < grid.x && y >= 0 && y < grid.y)
      grid.grid[x][y] = 1 ^ grid.grid[x][y];
}

function keyPressed() {
  // N for new ruleset
  if (keyCode == 78) {
    grid = new Grid();
    grid.grid[Math.round(grid.x/2)][Math.round(grid.y/2)] = 1;
    ruleset.newRules();
    window.location.hash = 'n=' + HashString['n'] + '&r=' + baseConvert(ruleset.rule.join(''), 2, 63);
  }

  // R for restart
  if (keyCode == 82) {
    fill(58, 71, 80);
    rect(0, 0, width, height);
    grid.grid = set2dArrayToZero(grid.grid)
  }

  // S for scramble 
  if (keyCode == 83) {
    grid.grid = set2dArrayRandom(grid.grid);
  }
}

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            return false;   
        }           
    }       
    return true;
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function set_new_neighborhood_and_rules(binary_neighbors) {
  neighborhood = new_neighborhood(binary_neighbors);
  rule_size = Math.pow(states, neighborhood.length);
  ruleset.newRules();
  var base63neighbors = baseConvert(binary_neighbors, 2, 63);
  window.location.hash = 'n=' + base63neighbors + '&r=' + baseConvert(ruleset.rule.join(''), 2, 63);
  HashString.n = base63neighbors;
}

function new_neighborhood(binary_neighbors) {
  var temp = [];
  for (var x = 0; x<binary_neighbors.length; x++) {
    if (binary_neighbors[x] == 1) {
      temp.push([x%5-2, Math.floor(x/5)-2]);
    }
  }
  return temp;
}

// Sets up the intial conidtions from the url
var HashString = function () {
  var query_string = {};
  var query = window.location.hash.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

var neighborhood = function () {
  if (HashString['n'] === undefined) {
    HashString['n'] = 'Ze5'; // The von neuman neighborhood
    return [[0, -1], [-1, 0], [1, 0], [0, 1]];
  }

  // Convert from base 63 to our representations of neighbors
  var binary_neighbors =  pad(baseConvert(HashString['n'], 63, 2), 25).split('');
  return new_neighborhood(binary_neighbors);
}();

var rule_size = function() {
  return Math.pow(states, neighborhood.length);
}();

var ruleset = function () {
  var temp = new RuleSet();

  if (HashString['r'] === undefined) {
    HashString['r'] = 'DXp';
  }

  temp = new RuleSet();
  temp.rule = pad(baseConvert(HashString['r'], 63, 2), rule_size).split('');

  return temp;
}();

// God have mercy on my soul for I have sined
function baseConvert(src, from_base, to_base, src_symbol_table, dest_symbol_table)
{
  // From: convert.js: http://rot47.net/_js/convert.js
  //  http://rot47.net
  //  http://helloacm.com
  //  http://codingforspeed.com  
  //  Dr Zhihua Lai
  //
  // Modified by MLM to work with BigInteger: https://github.com/peterolson/BigInteger.js
  // This is able to convert extremely large numbers; At any base equal to or less than the symbol table length
  src = '' + src;
  base_symbols = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.";
  // Default the symbol table to a nice default table that supports up to base 63
  src_symbol_table = src_symbol_table ? src_symbol_table : base_symbols;
  // Default the desttable equal to the srctable if it isn't defined
  dest_symbol_table = dest_symbol_table ? dest_symbol_table : src_symbol_table;
  
  // Make sure we are not trying to convert out of the symbol table range
  if(from_base > src_symbol_table.length || to_base > dest_symbol_table.length)
  {
    console.warn("Can't convert", src, "to base", to_base, "greater than symbol table length. src-table:", src_symbol_table.length, "dest-table:", dest_symbol_table.length);
    return false;
  }
  
  // First convert to base 10
  var val = bigInt(0);
  for (var i = 0; i < src.length; i ++)
  {
    val = val.multiply(from_base).add(src_symbol_table.indexOf(src.charAt(i)));
  }
  if (val.lesser(0))
  {
    return 0;
  }
  
  // Then covert to any base
  var r = val.mod(to_base);
  var res = dest_symbol_table.charAt(r);
  var q = val.divide(to_base);
  while(!q.equals(0))
  {
    r = q.mod(to_base);
    q = q.divide(to_base);
    res = dest_symbol_table.charAt(r) + res;
  }
  
  return res;
}

// Set the hash if there is none, okay not to check for overwrite.
window.location.hash = 'n=' + HashString['n'] + '&r=' + baseConvert(ruleset.rule.join(''), 2, 63);