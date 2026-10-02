/* Original supplied chart function for regression comparison.
   Copyright (c) 2026 biaogebaofu. All rights reserved. See LICENSE. */
const BEIJING = 8 * 3600000;
const BIAS = {木:0.3,火:0.5,土:0,金:-0.3,水:-0.5};
const GEN = {木:'火',火:'土',土:'金',金:'水',水:'木'};
const CTL = {木:'土',土:'水',水:'火',火:'金',金:'木'};
function calcBias(t) {
  t = new Date(t.getTime() + BEIJING);
  var days2 = Math.floor((t - new Date(Date.UTC(2000,0,7))) / 86400000);
  var ds = ((days2 % 10) + 10) % 10;
  var de = '木木火火土土金金水水'[ds];
  var dy = '阳阴阳阴阳阴阳阴阳阴'[ds];
  var m = t.getUTCMonth()+1, d = t.getUTCDate();
  var mi = 11;
  var ST = [[2,4],[3,6],[4,5],[5,6],[6,6],[7,7],[8,7],[9,8],[10,8],[11,7],[12,7],[1,6]];
  for (var i = 0; i < ST.length; i++) {
    if (m < ST[i][0] || (m === ST[i][0] && d < ST[i][1])) { mi = i > 0 ? i-1 : 11; break; }
  }
  var ys = (t.getUTCFullYear() - 4) % 10;
  var ms = ([2,4,6,8,0][ys%5] + mi) % 10;
  var me = '木木火火土土金金水水'[ms];
  var h = t.getUTCHours(), bi = ((h+1)%24) >> 1;
  var hs = ([0,2,4,6,8][ds%5] + bi) % 10;
  var he = '木木火火土土金金水水'[hs];
  var bias = (BIAS[de]||0)*0.35 + (BIAS[me]||0)*0.25 + (BIAS[he]||0)*0.20;
  if (GEN[de]===me) bias += 0.15; if (CTL[de]===me) bias -= 0.15;
  if (GEN[me]===de) bias += 0.1;  if (CTL[me]===de) bias -= 0.1;
  if (GEN[he]===de) bias += 0.08; if (CTL[he]===de) bias -= 0.08;
  if (dy === '阳') bias *= 1.15; else bias *= 0.85;
  return Math.max(-1, Math.min(1, bias));
}
module.exports = calcBias;
