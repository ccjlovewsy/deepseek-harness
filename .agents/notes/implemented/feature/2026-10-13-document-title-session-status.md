# Agent Note: Session status prefix in the browser document title

Status: implemented

English | [中文](2026-10-13-document-title-session-status.zh.md)

## Problem

A Harness page spends most of its life as a background browser tab or an unfocused Desktop window, where the conversation is invisible. A Session that stops for an approval or is still running gives no signal until the user returns to the tab, so pending interactions wait unnoticed.

## Decision

`DocumentTitle` in `client/ui-layout` subscribes the root slot runtime's `useSessionStatus` snapshot alongside the session list and panel info. The composed title keeps the existing base — the retained main-view Session title when no panel is active, otherwise the build-configured product title — and adds a status prefix aggregated across every Session in the workspace: `❗` when any Session has a pending interaction, otherwise `●` while any Session is running. The prefix applies to panel views as well, so the signal survives navigation away from the Chat. Unmounting still restores the bare product title.

`AppFrame` threads `useSessionStatus` from its root props into `DocumentTitle`; no other consumer changes. The prefix characters are fixed symbols, not localized copy, so the locale dictionaries carry nothing new.

## Alternatives considered

**Signal only the selected Session.** The selected Session is the one the user already watches; the signal exists for Sessions the user is not looking at. Aggregating across the workspace lets one pending approval mark the tab regardless of which Session is selected.

**Reuse `completionUnread` instead of `running`.** Completion badges belong to session list rows, where the user chooses what to open. A finished run needs no tab-level urgency; pending interaction and active work are the states that change what the user does next.

**Favicon or sidebar badge instead of the title.** A favicon variant needs per-theme assets and disappears in pinned tabs. Title text stays visible in tab strips, window titles, and OS task switchers on both Web and Desktop.

## Consequences

One waiting Session marks the whole application: the prefix does not identify which Session needs attention, and the user resolves that from the session list after returning. Title writes stay centralized in `DocumentTitle`, so the prefix composes with future base-title changes without new subscribers. Desktop window titles inherit the same signal with no Electron-specific code.

## Testing

`document-title.client.spec.tsx` covers the running prefix appearing and clearing with the status snapshot, pending interaction outranking running, and the prefix applying to panel views. The existing cases pin base-title selection and unmount restoration unchanged.
