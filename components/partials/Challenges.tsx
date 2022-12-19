import { allLessons, Lesson } from 'contentlayer/generated'
import Link from 'next/link'
import { ListItem } from './ListItem'

export const ChallengeList = ({ challenges, path }) => {
  const challengesData = challenges ? allLessons.filter((challenge: Lesson) => challenges.indexOf(challenge.slugAsParams) !== -1) : null

  return (
    <div className="justify-stretch mt-6 flex w-full grow items-start font-nunito text-white">
      {challengesData ? (
        <ul className="grid w-full items-start">
          {challengesData.map((challenge, index) => (
            <ListItem key={index + 1} position={index + 1} title={challenge.title} slug={challenge.slugAsParams} path={path} />
          ))}
        </ul>
      ) : (
        <p>Coming soon. Hang tight.</p>
      )}
    </div>
  )
}
