import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../../test/helpers/render';
import { ShoeDetailPage } from '../ShoeDetailPage';

describe('ShoeDetailPage', () => {
  it('renders the video panel when the shoe has video data', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/main/:brand/:shoesName" element={<ShoeDetailPage />} />
      </Routes>,
      {
        route: '/main/nike/v2k',
      }
    );

    expect(await screen.findByText('V2K 런')).toBeTruthy();
    expect(screen.getByText('영상 보러가기')).toBeTruthy();
    expect(screen.getByText('여러 착용 샷')).toBeTruthy();
  });

  it('hides the video panel when the shoe does not have video data', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/main/:brand/:shoesName" element={<ShoeDetailPage />} />
      </Routes>,
      {
        route: '/main/asics/jog100',
      }
    );

    expect(await screen.findByText('조그 100')).toBeTruthy();
    expect(screen.queryByText('영상 보러가기')).toBeNull();
  });

  it('renders a fallback card when the slug is invalid', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/main/:brand/:shoesName" element={<ShoeDetailPage />} />
      </Routes>,
      {
        route: '/main/nike/missing',
      }
    );

    expect(await screen.findByText('존재하지 않는 신발입니다.')).toBeTruthy();
    expect(
      screen.getByRole('link', { name: '신발 추천으로 돌아가기' })
    ).toBeTruthy();
  });
});
