import { getGPUTier } from 'detect-gpu';
import type { QualityConfig, QualityTier } from '../types/index.d.ts';

export let qualityConfig: QualityConfig = getDefaultConfig('high');

function getDefaultConfig(tier: QualityTier): QualityConfig {
  const configs: Record<QualityTier, QualityConfig> = {
    ultra: {
      tier: 'ultra',
      dpr: Math.min(window.devicePixelRatio, 2.0),
      shadowMapSize: 2048,
      rainParticles: 10000,
      volumetrics: true,
      ssrEnabled: true,
      dofEnabled: true,
      motionBlurEnabled: true,
      fogQuality: 'full',
    },
    high: {
      tier: 'high',
      dpr: Math.min(window.devicePixelRatio, 1.5),
      shadowMapSize: 1024,
      rainParticles: 3000,
      volumetrics: true,
      ssrEnabled: false,
      dofEnabled: true,
      motionBlurEnabled: false,
      fogQuality: 'light',
    },
    low: {
      tier: 'low',
      dpr: Math.min(window.devicePixelRatio, 1.25),
      shadowMapSize: 0,
      rainParticles: 500,
      volumetrics: false,
      ssrEnabled: false,
      dofEnabled: false,
      motionBlurEnabled: false,
      fogQuality: 'fake',
    },
  };
  return configs[tier];
}

/** Detect GPU tier and set quality config. Call once at startup. */
export async function initQuality(): Promise<void> {
  try {
    const gpuTier = await getGPUTier();

    // Mobile always gets Low tier regardless of GPU score
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    let tier: QualityTier;
    if (isMobile || gpuTier.tier === 0) {
      tier = 'low';
    } else if (gpuTier.tier >= 3) {
      tier = 'ultra';
    } else {
      tier = 'high';
    }

    qualityConfig = getDefaultConfig(tier);
    console.info(`[NACHTSCHLEIFE] GPU tier: ${gpuTier.tier}, Quality: ${tier}`);
  } catch {
    // Fallback to high if detection fails
    qualityConfig = getDefaultConfig('high');
  }
}

/** Downgrade one tier (called when FPS drops below 50 for 2+ seconds) */
export function downgradeTier(): void {
  const map: Record<QualityTier, QualityTier> = {
    ultra: 'high',
    high: 'low',
    low: 'low',
  };
  const next = map[qualityConfig.tier];
  if (next !== qualityConfig.tier) {
    qualityConfig = getDefaultConfig(next);
    console.warn(`[NACHTSCHLEIFE] Dynamic downgrade → ${next}`);
    window.dispatchEvent(new CustomEvent('quality:changed', { detail: qualityConfig }));
  }
}
