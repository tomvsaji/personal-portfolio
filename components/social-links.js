const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 1.5C6.201 1.5 1.5 6.298 1.5 12.215c0 4.734 3.009 8.75 7.184 10.167.525.1.716-.232.716-.516 0-.255-.009-.93-.014-1.825-2.922.648-3.539-1.436-3.539-1.436-.478-1.24-1.168-1.57-1.168-1.57-.955-.664.072-.651.072-.651 1.056.076 1.611 1.107 1.611 1.107.938 1.644 2.46 1.169 3.06.894.095-.695.367-1.17.667-1.439-2.333-.272-4.785-1.188-4.785-5.287 0-1.168.409-2.124 1.08-2.873-.109-.272-.468-1.367.102-2.85 0 0 .882-.289 2.889 1.097A9.89 9.89 0 0 1 12 6.82a9.9 9.9 0 0 1 2.632.366c2.007-1.386 2.887-1.097 2.887-1.097.571 1.483.212 2.578.104 2.85.672.75 1.078 1.705 1.078 2.873 0 4.11-2.456 5.012-4.796 5.28.377.331.713.983.713 1.982 0 1.43-.013 2.583-.013 2.935 0 .286.189.62.722.515 4.171-1.42 7.176-5.434 7.176-10.166C22.5 6.298 17.799 1.5 12 1.5Z"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M4.983 3.5a1.983 1.983 0 1 0 0 3.966 1.983 1.983 0 0 0 0-3.966ZM3.5 8.75h2.966V20.5H3.5V8.75Zm5.287 0h2.844v1.603h.04c.396-.75 1.364-1.542 2.808-1.542 3.002 0 3.556 1.98 3.556 4.554V20.5h-2.965v-6.323c0-1.508-.027-3.446-2.101-3.446-2.104 0-2.427 1.644-2.427 3.338V20.5H8.787V8.75Z"
    />
  </svg>
)

const XIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M18.901 2.25H21.9l-6.55 7.486L23 21.75h-6.004l-4.7-6.908-6.045 6.908H3.25l7.004-8.006L1 2.25h6.156l4.249 6.318L18.9 2.25Zm-1.052 17.7h1.662L6.253 3.955H4.47L17.849 19.95Z"
    />
  </svg>
)

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm2.108-.75 6.892 5.322L18.892 4.5H5.108Zm14.392 1.895-6.584 5.086a1.5 1.5 0 0 1-1.832 0L4.5 6.395v12.355c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V6.395Z"
    />
  </svg>
)

const iconMap = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  email: EmailIcon,
}

export default function SocialLinks({ links, className = '', iconClassName = '', label = 'External links' }) {
  return (
    <div className={className} aria-label={label}>
      {links.map(({ href, name, title }) => {
        const Icon = iconMap[name]

        if (!Icon) {
          return null
        }

        return (
          <a
            key={name}
            href={href}
            target={name === 'email' ? undefined : '_blank'}
            rel={name === 'email' ? undefined : 'noreferrer'}
            aria-label={title}
            title={title}
            className={iconClassName}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}
