import { Block, KnownBlock } from "@slack/bolt"
import { restaurants } from '../constants/data.json'
import { getRandomUniqueSuggestions } from '../utils/suggest'
import { SLACK_BOT_OAUTH_TOKEN } from "./env"

// @ts-ignore
export type Suggestion = {
  name: string
  id: number
  votingUsers: string[]
}

export type Time = {
  value: string,
  restaurantId: string
  votingUsers: string[]
}

type Session = {
  [id: string]: { suggestions: Suggestion[], times: Time[] }
}

const session: Session = { }

const startLunchtime = (user: string) => {
  session[user] = { suggestions: getRandomUniqueSuggestions(3), times: [] }
}

const vote = (user: string, suggestionId:string, sessionId: string = 'blokash') => {
  console.log('vote', user, suggestionId)
  console.info('session', JSON.stringify(session[user], undefined, 4))
  session[sessionId].suggestions = session[sessionId].suggestions.map(suggestion => {
    const shouldIncrement = suggestion.id === Number(suggestionId)

    const newVotingUsers = suggestion.votingUsers.includes(user) ? 
      suggestion.votingUsers.filter(votingUser => votingUser !== user) 
      : [ ...suggestion.votingUsers, user]
    return {
      ...suggestion,
      votingUsers: shouldIncrement ? newVotingUsers : suggestion.votingUsers
    }
  })
}

const veto = (user: string, suggestionId: string, sessionId: string = 'blokash') => {
  console.log('veto')
  const theSession = session[sessionId]
  console.log('current session', theSession)


  const keepSuggestionIds: number[] = theSession.suggestions.filter(s => s.id !== Number(suggestionId)).map(s => s.id)
  console.log('keep ids:', keepSuggestionIds)

  session[sessionId].suggestions = theSession.suggestions.map(suggestion => {
    // can't veto a suggestion that already has votes
    const hasVotes = theSession.times.find(t =>
      Number(t.restaurantId) === suggestion.id
      && t.votingUsers.length > 0
    )

    const shouldReplace = !keepSuggestionIds.includes(suggestion.id) && !hasVotes
    if (shouldReplace) {
      const newSuggestion = getRandomUniqueSuggestions(1, keepSuggestionIds)
      return newSuggestion[0]
    }

    return suggestion
  })
}

const addTime = (user: string, value: string, restaurantId: string) => {
  let times = session['blokash'].times

  const isTimeAlreadyIncluded = times.some(t => t.value === value)
  if (!isTimeAlreadyIncluded) {
    times.push({ value, votingUsers: [], restaurantId })
  }

  times = times.map(t => {
    const shouldChange = t.value === value
    if (!shouldChange) {
      return t
    }

    const isUserAlreadyIncluded = t.votingUsers.includes(user)

    return {
      ...t,
      votingUsers: isUserAlreadyIncluded
        ? t.votingUsers.filter(votingUser => votingUser !== user)
        : [ ...t.votingUsers, user]
    }
  })

  session['blokash'].times = times
}

const sessionToBlocks = (user: string): KnownBlock[] => {
  // console.log('suggestionsToBlocks', JSON.stringify(suggestions, undefined, 2))
  // main voting
  const blocks: KnownBlock[] = []
  console.log('times', session[user].times)


  session[user].suggestions.forEach((s, i) => {
    const timesForSuggestion = session[user].times.filter(t => Number(t.restaurantId) === s.id)

    console.log('timesForSuggestion', timesForSuggestion)

    let textOfTimesForSuggestion = `\n${timesForSuggestion.map(t =>
      t.votingUsers.length > 0 ? `${t.value}: ${t.votingUsers.join(', ')}` : ''
    ).join('\n')}`

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${s.name}*\n${textOfTimesForSuggestion}`
      }
    })

    blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'timepicker',
          // "initial_time": "00:00",
          "placeholder": {
            "type": "plain_text",
            "text": "Select time"
          },
          "action_id": `selecttime-${s.id}`
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: `Veto`
          },
          value: `${s.id}`,
          action_id: `veto-${i}`
        }
      ]
    })

    return blocks
  })
  

  // veto buttons
  // blocks.push({
  //   type: "actions",
  //   elements: suggestions.map((s, i) => ({
  //     type: 'button',
  //     text: {
  //       type: 'plain_text',
  //       text: `Veto ${s.name}`
  //     },
  //     value: `${s.id}`,
  //     action_id: `veto-${i}`
  //   }))
    // "elements": [
    //   {
    //     "type": "button",
    //     "text": {
    //       "type": "plain_text",
    //       "text": "Click Me",
    //       "emoji": true
    //     },
    //     "value": "click_me_123",
    //     "action_id": "actionId-0"
    //   },
    //   {
    //     "type": "button",
    //     "text": {
    //       "type": "plain_text",
    //       "text": "Click Me",
    //       "emoji": true
    //     },
    //     "value": "click_me_123",
    //     "action_id": "actionId-1"
    //   }
    // ]
  // } as KnownBlock)
  return blocks
}

const timesToBlocks = (times: Time[]) => {
  // selected times
  const blocks: KnownBlock[] = times.map(t => {
    return {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${t.value}: ${t.votingUsers.join(', ')}`
      }, 
			accessory: {
				type: "button",
				text: {
					type: "plain_text",
					text: "Vote",
					emoji: true
				},
				value: `${t.value}`,
				action_id: "vote-time"
			}
    } as KnownBlock

  })

  // time select
  blocks.push({ type: "actions", elements: [
    {
      type: 'timepicker',
      // "initial_time": "00:00",
      "placeholder": {
        "type": "plain_text",
        "text": "Select time"
      },
      "action_id": "select-time"
    }
  ]})

  return blocks
}

export {
  session,
  startLunchtime,
  vote,
  veto,
  sessionToBlocks,
  addTime
}