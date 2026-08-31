import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileDropzone } from '@/components/ui/FileDropzone';

function createFile(name: string, type = 'image/png') {
  return new File(['content'], name, { type });
}

describe('FileDropzone', () => {
  it('uses the label prop as the accessible name', () => {
    render(<FileDropzone label='로고 이미지' onFileSelect={vi.fn()} />);

    expect(
      screen.getByLabelText('로고 이미지', { selector: 'input' })
    ).not.toBeNull();
  });

  it('gives two dropzones with different labels different accessible names', () => {
    render(
      <>
        <FileDropzone label='지도 1' onFileSelect={vi.fn()} />
        <FileDropzone label='지도 2' onFileSelect={vi.fn()} />
      </>
    );

    const map1 = screen.getByLabelText('지도 1', { selector: 'input' });
    const map2 = screen.getByLabelText('지도 2', { selector: 'input' });

    expect(map1).not.toBe(map2);
    expect(map1.getAttribute('aria-labelledby')).not.toBe(
      map2.getAttribute('aria-labelledby')
    );
  });

  it('links prompt, hint, and error through aria-describedby', () => {
    render(
      <FileDropzone
        label='로고 이미지'
        prompt='로고 파일을 끌어다 놓거나 선택하세요'
        hint='PNG · JPG · 최대 10MB'
        error='허용되지 않은 파일 형식입니다.'
        onFileSelect={vi.fn()}
      />
    );

    const input = screen.getByLabelText('로고 이미지', { selector: 'input' });
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const ids = (describedBy as string).split(' ');
    const texts = ids.map(
      (elementId) => document.getElementById(elementId)?.textContent
    );

    expect(texts).toContain('로고 파일을 끌어다 놓거나 선택하세요');
    expect(texts).toContain('PNG · JPG · 최대 10MB');
    expect(texts).toContain('허용되지 않은 파일 형식입니다.');
  });

  it('renders the error with role alert and marks the input invalid', () => {
    render(
      <FileDropzone
        label='로고 이미지'
        error='허용되지 않은 파일 형식입니다.'
        onFileSelect={vi.fn()}
      />
    );

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('허용되지 않은 파일 형식입니다.');

    const input = screen.getByLabelText('로고 이미지', { selector: 'input' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('calls onFileSelect with the dropped file', () => {
    const onFileSelect = vi.fn();
    render(<FileDropzone label='지도' onFileSelect={onFileSelect} />);

    const file = createFile('map.png');
    const dropTarget = screen.getByText('파일을 끌어다 놓거나 선택하세요');

    fireEvent.drop(dropTarget, {
      dataTransfer: {
        files: [file],
        items: [],
        types: ['Files'],
      },
    });

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('sets data-dragging on dragOver and clears it on dragLeave', () => {
    render(<FileDropzone label='지도' onFileSelect={vi.fn()} />);

    const dropTarget = screen
      .getByText('파일을 끌어다 놓거나 선택하세요')
      .closest('label') as HTMLLabelElement;

    fireEvent.dragOver(dropTarget, {
      dataTransfer: { files: [], items: [], types: ['Files'] },
    });
    expect(dropTarget.getAttribute('data-dragging')).toBe('true');

    fireEvent.dragLeave(dropTarget, {
      dataTransfer: { files: [], items: [], types: ['Files'] },
    });
    expect(dropTarget.getAttribute('data-dragging')).toBeNull();
  });

  it('calls onFileSelect when a file is chosen through the picker', async () => {
    const user = userEvent.setup();
    const onFileSelect = vi.fn();
    render(<FileDropzone label='로고 이미지' onFileSelect={onFileSelect} />);

    const file = createFile('logo.png');
    const input = screen.getByLabelText('로고 이미지', {
      selector: 'input',
    }) as HTMLInputElement;

    await user.upload(input, file);

    expect(onFileSelect).toHaveBeenCalledTimes(1);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it('renders the clear button only when both file and onClear are given, and calls onClear', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const file = createFile('logo.png');

    const { rerender } = render(
      <FileDropzone label='로고 이미지' file={file} onFileSelect={vi.fn()} />
    );

    expect(
      screen.queryByRole('button', { name: '로고 이미지 파일 지우기' })
    ).toBeNull();

    rerender(
      <FileDropzone
        label='로고 이미지'
        file={file}
        onFileSelect={vi.fn()}
        onClear={onClear}
      />
    );

    const clearButton = screen.getByRole('button', {
      name: '로고 이미지 파일 지우기',
    });

    await user.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('ignores a drop when disabled', () => {
    const onFileSelect = vi.fn();
    render(<FileDropzone label='지도' disabled onFileSelect={onFileSelect} />);

    const file = createFile('map.png');
    const dropTarget = screen
      .getByText('파일을 끌어다 놓거나 선택하세요')
      .closest('label') as HTMLLabelElement;

    fireEvent.drop(dropTarget, {
      dataTransfer: { files: [file], items: [], types: ['Files'] },
    });

    expect(onFileSelect).not.toHaveBeenCalled();
    expect(dropTarget.getAttribute('data-dragging')).toBeNull();
  });
});
