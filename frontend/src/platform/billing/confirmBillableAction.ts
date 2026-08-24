export function confirmBillableAction(action: string, detail: string): boolean {
  return window.confirm([
    `${action} may use a metered cloud service and could become billable if plan limits are exceeded.`,
    '',
    detail,
    '',
    'Do you want to continue?',
  ].join('\n'))
}
