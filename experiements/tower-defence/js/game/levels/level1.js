// Path waypoints (tile coords * tileSize)
const T = 32;
export const level1 = {
  path: [
    [0*T,2*T],
    [6*T,2*T],
    [6*T,8*T],
    [16*T,8*T],
    [16*T,13*T],
    [19*T,13*T]
  ],
  waves: [
    [{ timeOffsetMs:0, enemyType:'basic', count:4 }],
    [{ timeOffsetMs:0, enemyType:'basic', count:6 }, { timeOffsetMs:2500, enemyType:'fast', count:4 }],
    [{ timeOffsetMs:0, enemyType:'basic', count:8 }, { timeOffsetMs:3000, enemyType:'fast', count:6 }],
    [{ timeOffsetMs:0, enemyType:'fast', count:10 }, { timeOffsetMs:3500, enemyType:'basic', count:8 }],
    [{ timeOffsetMs:0, enemyType:'basic', count:12 }, { timeOffsetMs:4000, enemyType:'fast', count:12 }]
  ]
};
