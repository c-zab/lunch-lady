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

const vote = (user: string, sessionId:string, voteId: string) => {
  session[sessionId].map(suggestion => ({
    ...suggestion,
    votingUsers: [...suggestion.votingUsers, user]
  }))
}

const suggestionsToBlocks = (suggestions: Suggestion[]): KnownBlock[] => {
  const blocks: KnownBlock[] = suggestions.map(s => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${s.name}`
      }
    } as KnownBlock
  })

  return blocks
  
}

const sessionToBlocks = (user: string) => {
  return suggestionsToBlocks(session[user])
}

export {
  session,
  startLunchtime,
  vote,
  sessionToBlocks
}