// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { snapshotCaptureAction } from '../events/handlers';

describe('snapshotCaptureAction', () => {
  it('retains the original target bounds when a click immediately removes the target for a modal', () => {
    const button = document.createElement('button');
    button.textContent = 'Create public link';
    document.body.appendChild(button);
    Object.defineProperty(button, 'getBoundingClientRect', {
      value: () => ({ x: 320, y: 440, width: 160, height: 42 }),
    });

    const snapshot = snapshotCaptureAction('click', button);
    button.remove();

    expect(snapshot.elementMeta.rect).toEqual({ x: 320, y: 440, width: 160, height: 42 });
    expect(snapshot.domContext.target).toMatchObject({ name: 'Create public link', action: 'click' });
  });
});
