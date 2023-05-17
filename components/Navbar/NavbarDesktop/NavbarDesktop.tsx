'use client'

import clsx from 'clsx'

import { useLocalizedRoutes, useTranslations, useLang } from 'hooks'
import { chapters, lessons } from 'content'
import Address from 'components/Navbar/Address'
import TabGroup from 'components/Navbar/NavbarDesktop/TabGroup'
import UserButton from '../UserButton'
import Link from 'next/link'
import HelpLink from '../HelpLink'
import Icon from 'shared/Icon'

export default function NavbarDesktop({ params }) {
  const routes = useLocalizedRoutes()
  const lang = useLang()
  const t = useTranslations(lang)

  const { slug, lesson: lessonId } = params

  //If theme was specified on lesson it should take priority over a theme that was specified on a chapter, otherwise fallback to bg-back. In this case it is used to apply an opacity for transparent outro screens
  const theme =
    lessons[slug]?.[lessonId]?.metadata.theme ??
    chapters[slug]?.metadata.theme ??
    'bg-back'

  return (
    <div
      className={clsx('left-0 top-0 hidden w-full md:block', {
        'bg-transparent/20': theme === 'bg-transparent',
      })}
    >
      <div className="flex h-[70px] items-stretch justify-between border-b border-white/80 text-white">
        <div className="flex">
          <Link
            title={t('shared.poweroff')}
            className="group flex items-center border-r border-white/25 p-5 text-sm text-white transition duration-100 ease-in-out hover:bg-black/20"
            href={routes.chaptersUrl}
          >
            <Icon
              icon="powerOff"
              className="h-[30px] w-[30px] opacity-75 transition duration-100 ease-in-out group-hover:opacity-100"
            />
          </Link>

          <Address />
        </div>
        <nav className="flex items-center">
          <TabGroup params={params} />
          <HelpLink params={params} />
          <UserButton />
        </nav>
      </div>
    </div>
  )
}
