import { isRed, type Card } from '../engine/cards'

interface Props {
  card?: Card
  faceDown?: boolean
  small?: boolean
  /** Optional count tag shown beneath the card (review mode). */
  tag?: number
}

export function PlayingCard({ card, faceDown, small, tag }: Props) {
  const cls = ['card', small ? 'card-small' : '', faceDown || !card ? 'card-back' : '', card && isRed(card) ? 'red' : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className="card-wrap">
      <div className={cls} aria-label={faceDown || !card ? 'face-down card' : `${card.rank}${card.suit}`}>
        {card && !faceDown && (
          <>
            <span className="corner tl">
              {card.rank}
              <br />
              {card.suit}
            </span>
            <span className="pip">{card.suit}</span>
            <span className="corner br">
              {card.rank}
              <br />
              {card.suit}
            </span>
          </>
        )}
      </div>
      {tag !== undefined && <span className={`tag ${tag > 0 ? 'pos' : tag < 0 ? 'neg' : ''}`}>{tag > 0 ? `+${tag}` : tag}</span>}
    </div>
  )
}

export function CardRow({ cards, hideSecond, small }: { cards: Card[]; hideSecond?: boolean; small?: boolean }) {
  return (
    <div className="card-row">
      {cards.map((c, i) => (
        <PlayingCard key={i} card={c} faceDown={hideSecond && i === 1} small={small} />
      ))}
    </div>
  )
}
