/**
 * @file The main file that runs the extension.
 * @author Mikey Lau
 * {@link https//mikeylau.uk|Portfolio}
 * {@link https://github.com/MikeyJL|Github}
 * @version 1.0
 */

const vscode = require('vscode')

/**
 * Runs once when the extension is activated.
 * @param {vscode.ExtensionContext} context - The extension context.
 */
function activate (context) {
  const config = vscode.workspace.getConfiguration('typewriterAutoScroll')
  const enable = config.get('enable')
  context.subscriptions.push(new TypewriterAutoScroll(enable))
}

/**
 * Runs once when the extension is deactivated.
 */
function deactivate () {}

/**
 * @class Typewriter controller.
 */
class TypewriterAutoScroll {
  /**
   * The state of the typewriter extension.
   * @param {boolean} enable - Whether the extension is enabled.
   */
  constructor (enable) {
    this.enable = enable
    if (!this.statusBar) {
      this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
    }

    const editor = vscode.window.activeTextEditor
    if (!editor) {
      this.statusBar.hide()
    } else {
      if (enable) {
        this.statusBar.text = 'Typewriter ON'
      } else {
        this.statusBar.text = 'Typewriter OFF'
      }
      this.statusBar.show()
    }

    const subscriptions = []
    vscode.commands.registerCommand('typewriterAutoScroll.toggleEnable', () => {
      this.toggleEnable()
    })
    vscode.workspace.onDidChangeConfiguration(this.onConfigurationChange, this, subscriptions)
    vscode.window.onDidChangeTextEditorSelection(this.onSelectionChange, this, subscriptions)
  }

  /**
   * Toggles the state of the typewriter auto-scroll.
   */
  toggleEnable () {
    this.enable = !this.enable

    const configuration = vscode.workspace.getConfiguration('typewriterAutoScroll')
    configuration.update('enable', this.enable)
    if (this.enable) {
      vscode.window.showInformationMessage('Typewriter auto-scroll is toggled on!')
      this.statusBar.text = 'Typewriter ON'
    } else {
      vscode.window.showInformationMessage('Typewriter auto-scroll is toggled off!')
      this.statusBar.text = 'Typewriter OFF'
    }
    this.statusBar.show()
  }

  /**
   * Centers the viewport onto the focused line when typewriter auto-scroll is enabled.
   */
  onSelectionChange () {
    if (this.enable) {
      const editor = vscode.window.activeTextEditor
      const selection = editor.selection
      const range = new vscode.Range(selection.active, selection.active)
      editor.revealRange(range, vscode.TextEditorRevealType.InCenter)
    }
  }

  /**
   * Updates the status and enabled state from the extension settings.
   */
  onConfigurationChange () {
    const configuration = vscode.workspace.getConfiguration('typewriterAutoScroll')
    if (configuration.get('enable')) {
      this.enable = true
      this.statusBar.text = 'Typewriter ON'
    } else {
      this.enable = false
      this.statusBar.text = 'Typewriter OFF'
    }
    this.statusBar.show()
  }
}

module.exports = {
  activate,
  deactivate
}
