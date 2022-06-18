import { Block, KnownBlock } from "@slack/bolt"
import { restaurants } from '../constants/data.json'
import { getRandomUniqueSuggestions } from '../utils/suggest'

// @ts-ignore
export type Suggestion = {
  name: string
  id: number
  votingUsers: string[]
}

type Session = {
  [id: string]: Suggestion[]
}

const session: Session = { }

const startLunchtime = (user: string) => {
  session[user] = getRandomUniqueSuggestions(3)
}

const vote = (user: string, suggestionId:string, sessionId: string = 'blokash') => {
  console.log('vote', user, suggestionId)
  console.info('session', JSON.stringify(session[user], undefined, 4))
  session[sessionId] = session[sessionId].map(suggestion => {
    const shouldIncrement = suggestion.id === Number(suggestionId)
    return {
      ...suggestion,
      votingUsers: shouldIncrement ? [...suggestion.votingUsers, user] : suggestion.votingUsers
    }
  })
}

const suggestionsToBlocks = (suggestions: Suggestion[]): KnownBlock[] => {
  console.log('suggestionsToBlocks', JSON.stringify(suggestions, undefined, 2))
  const blocks: KnownBlock[] = suggestions.map(s => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${s.name}: ${s.votingUsers.join(', ')}`
      }, 
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: "Vote",
					emoji: true
				},
				value: `${s.id}`,
				action_id: "vote"
			}
    } as KnownBlock
  })

  return blocks
  
}

const sessionToBlocks = (user: string) => {
  console.log('sessionsToBlocks', JSON.stringify(session[user], undefined, 2))
  return suggestionsToBlocks(session[user])
}

export {
  session,
  startLunchtime,
  vote,
  sessionToBlocks
}