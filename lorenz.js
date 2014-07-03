// Declare and set up parameters
//***********************************

var canvas = document.getElementById("cv");
var size = 600;
canvas.width = size; canvas.height = size;
var ctx = new createjs.Stage("cv");
var pt_size = 1; var fps = 50; var trace = [];
var scale,sigma,rho,beta,angle_x,angle_y,axes,axes_x,axes_y,dt,curr_pt;
var data_pts = []; var init_pt = [1,1,1]; var id;

function set() {
  sigma = 10; rho = 28; beta = 8/3; dt = 0.01;
  angle_x = 0; angle_y = 0; scale = 4;
  axes = [
  [Math.cos(angle_y),0,-Math.sin(angle_y)],
  [-Math.sin(angle_x),Math.cos(angle_x),Math.cos(angle_y)*-Math.sin(angle_x)],
  [Math.sin(angle_y)*Math.cos(angle_x),Math.sin(angle_x),Math.cos(angle_y)*Math.cos(angle_x)]
  ];
  axes_x = [
  [1,0,0],
  [0,Math.cos(angle_x),-Math.sin(angle_x)],
  [0,Math.sin(angle_x),Math.cos(angle_x)]
  ];

  axes_y = [
  [Math.cos(angle_y),0,Math.sin(angle_y)],
  [0,1,0],
  [-Math.sin(angle_y),0,Math.cos(angle_y)]
  ];
}

function reset() {
  set();
  clear_cv();
  var slider = document.getElementById("x_rotator");
  slider.value = 0;
  slider = document.getElementById("y_rotator");
  slider.value = 0;
  slider = document.getElementById("sigma");
  slider.value = 10;
  slider = document.getElementById("rho");
  slider.value = 28;
  slider = document.getElementById("beta");
  slider.value = 8/3;
  init(500);
}

function redraw() {
  clear_cv();
  reproject();
}

function clear_cv() {
  ctx.removeAllChildren();
}

// Slider input functions
//*************************

function fn_sigma(val) {
  sigma = val;
  init(500);
}

function fn_rho(val) {
  rho = val;
  init(500);
}

function fn_beta(val) {
  beta = val;
  init(500);
}

function rotate(val,dim) {
  if(dim == 'x') { angle_x = val; }
  if(dim == 'y') { angle_y = val; }
  axes = [
  [Math.cos(angle_y),0,-Math.sin(angle_y)],
  [-Math.sin(angle_x),Math.cos(angle_x),Math.cos(angle_y)*-Math.sin(angle_x)],
  [Math.sin(angle_y)*Math.cos(angle_x),Math.sin(angle_x),Math.cos(angle_y)*Math.cos(angle_x)]
  ];
  axes_x = [
  [1,0,0],
  [0,Math.cos(angle_x),-Math.sin(angle_x)],
  [0,Math.sin(angle_x),Math.cos(angle_x)]
  ];

  axes_y = [
  [Math.cos(angle_y),0,Math.sin(angle_y)],
  [0,1,0],
  [-Math.sin(angle_y),0,Math.cos(angle_y)]
  ];
  redraw();
}

// Calculating coordinates and projections
//*****************************************

function generate_pt(pt) {
  var next_pt = [
    pt[0] + dt * (sigma * (pt[1] - pt[0])),
    pt[1] + dt * (pt[0] * (rho - pt[2]) - pt[1]),
    pt[2] + dt * (pt[0] * pt[1] - beta * pt[2])
  ];
  return next_pt;
}

function matrix_mult(pt,axes) {
  var new_pt = [];
  for (var i=0; i < 3; i++) {
    new_pt[i] = 0;
    for (var j = 0; j < 3; j++) {
      new_pt[i] += pt[j] * axes[j][i];
    }
  }
  return new_pt;
}

function project_pt(pt, axes1, axes2) {
  var new_pt = matrix_mult(pt,axes1);
  new_pt = matrix_mult(new_pt,axes2);
  new_pt[0] = new_pt[0]*scale + size/2; 
  new_pt[1] = new_pt[1]*scale + size/2;
  return new_pt;
}

function add_pt() {
  curr_pt = generate_pt(curr_pt);
  data_pts.push(curr_pt);
  var temp_pt = curr_pt;
  var pt = project_pt(temp_pt,axes_x,axes_y);
  trace.push(pt);
}

function reproject() {
  trace = [];
  for (var i = 0; i < data_pts.length; i++) {
    trace.push(project_pt(data_pts[i],axes_x,axes_y));
  };
}

function distance(pt1,pt2) {
  var xs = 0;
  var ys = 0;
  xs = pt2[0] - pt1[0];
  xs = xs * xs;
  ys = pt2[1] - pt1[1];
  ys = ys * ys;
  return Math.sqrt( xs + ys );
}

// Drawing on canvas 
//*********************

function paint_pt(x,y,color) {
  var circle = new createjs.Shape();
  circle.graphics.beginFill(color).drawCircle(0, 0, 1);
  circle.x = x;
  circle.y = y;
  ctx.addChild(circle);
}

function paint() {
  paint_pt(size/2,size/2,'#00DCDC');
  for (var i = 0; i < trace.length-4; i+=1) {
    //paint_pt(trace[i][0],trace[i][1],'#00FF00');
    if(distance(trace[i],trace[i+1]) > 100) {
      curve(trace[i],trace[i+1],trace[i+2],'#DC0000',5);
    } else { 
      line(trace[i],trace[i+1],'#DC0000',0.8);
    }
  };
  ctx.update();
}

function curve(pt1,cp,pt2,color,w) {
  var p = [[],[]];
  p[0] = cp[0] * 2 - (pt1[0]+pt2[0])/2;
  p[1] = cp[1] * 2 - (pt1[1]+pt2[1])/2;
  var g = new createjs.Graphics();
  g.beginFill(color);
  g.lineWidth = w;
  g.moveTo(pt1[0],pt1[1]);
  g.quadraticCurveTo(p[0],p[1],pt2[0],pt2[1]);
  var s = new createjs.Shape(g);
  ctx.addChild(s);
}

function line(pt1,pt2,color,w) {
  var g = new createjs.Graphics();
  g.setStrokeStyle(w);
  g.beginStroke(color)
  g.lineWidth = w;
  g.moveTo(pt1[0],pt1[1]);
  g.lineTo(pt2[0],pt2[1]);
  g.endStroke();
  var s = new createjs.Shape(g);
  ctx.addChild(s);
}

// Working the animation
//***********************


function init(amnt) {
  trace = [];
  clear_cv();
  data_pts = [];
  data_pts.push(generate_pt(init_pt));
  curr_pt = data_pts[0];
  for (var i = 0; i < amnt; i++) {
    add_pt();
  }
  paint();
}

function generate() {
  for (var i = 0; i < 2; i++) {
    add_pt();  
  }
  trace.splice(0,2);
  data_pts.splice(0,2);
  clear_cv();
  paint();
}

function start() {
  set();
  init(500);
  tick();
}

function tick() {
  id = setInterval(generate, 1000/fps);
}

