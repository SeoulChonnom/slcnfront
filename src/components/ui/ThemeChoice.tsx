import { useId } from 'react';
import { THEME_PREFERENCES, type ThemePreference } from '../../lib/theme/theme';
import { useTheme } from '../../lib/theme/useTheme';
import { cn } from '../../lib/utils/cn';

const LABELS: Record<ThemePreference, string> = {
  system: '시스템',
  light: '밝게',
  dark: '어둡게',
};

const GROUP_LABEL = '화면 밝기';

type ThemeChoiceProps = {
  /**
   * Inside a `role="menu"` the options have to be menuitemradio buttons: a
   * radiogroup of native inputs nested in a menu is not a structure screen
   * readers announce coherently. Everywhere else native radios are the
   * better markup, and they bring their own arrow-key behaviour.
   */
  inMenu?: boolean;
  className?: string;
};

/**
 * Three options rather than a light/dark switch. A switch has to choose a
 * side on first load, and that choice then quietly outranks the reader's
 * operating-system setting forever; 'system' is what gives it back.
 *
 * Labelled rather than iconified on purpose: a sun-and-moon pair is the most
 * worn signifier in the interface vocabulary, and it cannot show the third
 * state at all without inventing a third glyph nobody reads correctly.
 */
export function ThemeChoice({ inMenu = false, className }: ThemeChoiceProps) {
  const { preference, setPreference } = useTheme();
  const groupName = useId();

  return (
    <fieldset
      className={cn('slcn-theme-choice', className)}
      aria-label={GROUP_LABEL}
    >
      {THEME_PREFERENCES.map((option) => {
        const checked = option === preference;

        if (inMenu) {
          return (
            <button
              key={option}
              type='button'
              className='slcn-theme-choice__option'
              role='menuitemradio'
              aria-checked={checked}
              data-checked={checked}
              onClick={() => setPreference(option)}
            >
              {LABELS[option]}
            </button>
          );
        }

        return (
          <label
            key={option}
            className='slcn-theme-choice__option'
            data-checked={checked}
          >
            <input
              type='radio'
              name={groupName}
              value={option}
              checked={checked}
              onChange={() => setPreference(option)}
            />
            {LABELS[option]}
          </label>
        );
      })}
    </fieldset>
  );
}
