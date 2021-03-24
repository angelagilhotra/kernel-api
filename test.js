const date = 'Mar 25, 2021 6:30 PM GMT'
const p = new Date(date)
console.log (p.toLocaleDateString('en-US'))
console.log (p.getUTCHours() + ':' + p.getUTCMinutes())