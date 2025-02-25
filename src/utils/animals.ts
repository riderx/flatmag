const animals = [
  { name: 'Fox', color: '#F97316' },
  { name: 'Wolf', color: '#6B7280' },
  { name: 'Bear', color: '#92400E' },
  { name: 'Deer', color: '#B45309' },
  { name: 'Owl', color: '#78350F' },
  { name: 'Lion', color: '#D97706' },
  { name: 'Tiger', color: '#EA580C' },
  { name: 'Panda', color: '#4B5563' },
  { name: 'Koala', color: '#737373' },
  { name: 'Rabbit', color: '#A3A3A3' },
  { name: 'Penguin', color: '#0F172A' },
  { name: 'Dolphin', color: '#0EA5E9' },
  { name: 'Elephant', color: '#64748B' },
  { name: 'Giraffe', color: '#CA8A04' },
  { name: 'Kangaroo', color: '#A16207' },
]

export function getRandomAnimal() {
  return animals[Math.floor(Math.random() * animals.length)]
}
