import assert from 'node:assert';
import test from 'node:test';
import { buildAppHomeView } from '../../../listeners/views/app-home-builder.js';

test('buildAppHomeView', async (t) => {
  await t.test('returns a valid home view', () => {
    const view = buildAppHomeView();
    assert.strictEqual(view.type, 'home');
    assert.ok(Array.isArray(view.blocks));
    assert.ok(view.blocks.length > 0);

    // Check header
    const header = view.blocks.find((b: any) => b.type === 'header') as any;
    assert.ok(header);
    assert.ok(header.text.text.includes('Godspeed SOP Assistant'));
  });

  await t.test('shows disconnected state when no url or connected status', () => {
    const view = buildAppHomeView();
    const section = view.blocks.find((b: any) => b.type === 'section' && b.text?.text?.includes('disconnected')) as any;
    assert.ok(section);
  });

  await t.test('shows install url when disconnected but url provided', () => {
    const view = buildAppHomeView('https://example.com/install');
    const section = view.blocks.find((b: any) => b.type === 'section' && b.text?.text?.includes('disconnected')) as any;
    assert.ok(section);
    assert.ok(section.text.text.includes('https://example.com/install'));
  });

  await t.test('shows connected state when connected', () => {
    const view = buildAppHomeView(null, true);
    const section = view.blocks.find((b: any) => b.type === 'section' && b.text?.text?.includes('connected')) as any;
    assert.ok(section);
    assert.ok(!section.text.text.includes('disconnected'));
  });
});
