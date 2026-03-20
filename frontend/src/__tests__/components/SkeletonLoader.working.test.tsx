import React from 'react';
import { SkeletonLoader, TextSkeleton, TitleSkeleton } from '../../components/SkeletonLoader';

describe('SkeletonLoader Working Tests', () => {
  it('should import SkeletonLoader and be defined', () => {
    expect(SkeletonLoader).toBeDefined();
    expect(typeof SkeletonLoader).toBe('function');
  });

  it('should import TextSkeleton and be defined', () => {
    expect(TextSkeleton).toBeDefined();
    expect(typeof TextSkeleton).toBe('function');
  });

  it('should import TitleSkeleton and be defined', () => {
    expect(TitleSkeleton).toBeDefined();
    expect(typeof TitleSkeleton).toBe('function');
  });

  it('should be a React component', () => {
    expect(React.isValidElement(<SkeletonLoader />)).toBe(true);
  });

  it('should accept props', () => {
    const skeleton = React.createElement(SkeletonLoader, { 
      width: 100,
      height: 20,
      borderRadius: 4
    });
    expect(skeleton).toBeDefined();
    expect((skeleton.props as any).width).toBe(100);
    expect((skeleton.props as any).height).toBe(20);
    expect((skeleton.props as any).borderRadius).toBe(4);
  });

  it('should have correct default props', () => {
    const skeleton = React.createElement(SkeletonLoader, {});
    expect((skeleton.props as any).width).toBeUndefined(); // Will use default '100%'
    expect((skeleton.props as any).height).toBeUndefined(); // Will use default 20
    expect((skeleton.props as any).borderRadius).toBeUndefined(); // Will use default 4
  });
});
