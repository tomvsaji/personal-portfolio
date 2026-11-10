// One restoration per interaction lifecycle, performed only after React commits.
export function createChatFocus(panel, body) {
  let restore = false
  return {
    begin(active) { restore = panel.contains(active) },
    interact(target) { if (!panel.contains(target)) restore = false },
    reset() { restore = false },
    restore(input, active) {
      if (!restore || !input || input.disabled) return
      restore = false
      // BODY is expected when disabling or removing the previously focused control.
      if (active === body || panel.contains(active)) input.focus()
    },
  }
}
