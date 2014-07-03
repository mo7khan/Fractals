// Declare and set up parameters
//***********************************

var canvas = document.getElementById("cv");
var size = 600;
canvas.width = size; canvas.height = size;
var ctx = new createjs.Stage("cv");
var pt_size = 1; var fps = 50; var trace = [];
var scale,ptA,ptB,ptC,ptD,angle_x,angle_y,axes_x,axes_y,curr_pt,depth;
var data_pts = []; var init_pt = [1,1,1];
var steps = [0.65,0.45,0.15,0.10,0.05,0.01];

function set() {
  ptA = [0,0,Math.sqrt(2/3)-1/(2*Math.sqrt(6))]; 
  ptB = [-1/(2*Math.sqrt(3)),-1/2,-1/(2*Math.sqrt(6))]; 
  ptC = [-1/(2*Math.sqrt(3)),1/2,-1/(2*Math.sqrt(6))];
  ptD = [1/(Math.sqrt(3)),0,-1/(2*Math.sqrt(6))];
  angle_x = 0; angle_y = 0; scale = 256; depth = 0.65;
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

// Input functions
//*************************

function fn_iter(val) {
  depth = steps[val];
  data_pts = [];
  tick(ptA,ptB,ptC,ptD);
  draw();
}

function rotate(val,dim) {
  if(dim == 'x') { angle_x = val; }
  if(dim == 'y') { angle_y = val; }
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
  draw();
}

function reset() {
  data_pts = [];
  start();
}

// Calculating coordinates and projections
//*****************************************

function project_pt(pt, axes) {
  var new_pt = [];
  for (var i=0; i < 3; i++) {
    new_pt[i] = 0;
    for (var j = 0; j < 3; j++) {
      new_pt[i] += pt[j] * axes[j][i];
    }
  }
  return new_pt;
}

function scale_pt(pt) {
  var new_pt = [];
  new_pt[0] = pt[0]*scale + size/2; 
  new_pt[1] = pt[1]*scale + size/2;
  return new_pt;
}

function distance(pt1,pt2) {
  var xs = 0;
  var ys = 0;
  var zs = 0;
  xs = pt2[0] - pt1[0];
  xs = xs * xs;
  ys = pt2[1] - pt1[1];
  ys = ys * ys;
  zs = pt2[2] - pt1[2];
  zs = zs * zs;
  return Math.sqrt( xs + ys + zs );
}

function midpt(pt1,pt2) {
  var m = [(pt1[0]+pt2[0])/2, (pt1[1]+pt2[1])/2, (pt1[2]+pt2[2])/2];
  return m;
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

var store;
function draw() {
  clear_cv();
  for (var i = 0; i < data_pts.length; i++) {
    draw_tetrahedron(data_pts[i][0],data_pts[i][1],data_pts[i][2],data_pts[i][3]);
  };
  ctx.update();
}

function clear_cv() {
  ctx.removeAllChildren();
}

// Working the animation
//***********************

function canvas_pt(pt) {
  var new_pt = project_pt(pt,axes_x);
  new_pt = project_pt(new_pt,axes_y);
  new_pt = scale_pt(new_pt);
  return new_pt;
}

function draw_triangle(pta,ptb,ptc) {
  var pt1 = canvas_pt(pta); 
  var pt2 = canvas_pt(ptb); 
  var pt3 = canvas_pt(ptc);
  line(pt1,pt2,'#DC0000',1);
  line(pt2,pt3,'#DC0000',1);
  line(pt3,pt1,'#DC0000',1);
}

function draw_tetrahedron(pta,ptb,ptc,ptd) {
  draw_triangle(pta,ptb,ptc);
  draw_triangle(pta,ptb,ptd);
  line(canvas_pt(ptc),canvas_pt(ptd),'#DC0000',1);
}

function tick(pta,ptb,ptc,ptd) {
  if(distance(pta,ptb) < depth) { return; }
  if(distance(pta,ptb) < depth + 0.5) { 
    data_pts.push([pta,ptb,ptc,ptd]);
  }
  var m_ab = midpt(pta,ptb);
  var m_ac = midpt(pta,ptc);
  var m_ad = midpt(pta,ptd);
  var m_bc = midpt(ptc,ptb);
  var m_bd = midpt(ptd,ptb);
  var m_cd = midpt(ptc,ptd);
  tick(ptb,m_ab,m_bc,m_bd);
  tick(pta,m_ab,m_ac,m_ad);
  tick(ptd,m_cd,m_ad,m_bd);
  tick(ptc,m_bc,m_ac,m_cd);
}

function start() {
  set();
  tick(ptA,ptB,ptC,ptD);
  draw();
}

