import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const TicketSkeleton = () => (
  <SkeletonPlaceholder>
    <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" padding={20}>
      <SkeletonPlaceholder.Item width={120} height={120} borderRadius={10} />
      <SkeletonPlaceholder.Item marginLeft={10}>
        <SkeletonPlaceholder.Item width={200} height={24} borderRadius={4} />
        <SkeletonPlaceholder.Item width={150} height={20} borderRadius={4} marginTop={6} />
        <SkeletonPlaceholder.Item width={180} height={20} borderRadius={4} marginTop={6} />
        <SkeletonPlaceholder.Item width={100} height={20} borderRadius={4} marginTop={6} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
    <SkeletonPlaceholder.Item height={1} marginVertical={20} borderColor="#E2E2E2" borderWidth={1} />

    <SkeletonPlaceholder.Item padding={10}>
      <SkeletonPlaceholder.Item width={150} height={20} borderRadius={4} />
      <SkeletonPlaceholder.Item width={100} height={30} borderRadius={4} marginTop={10} />
      <SkeletonPlaceholder.Item width={200} height={20} borderRadius={4} marginTop={10} />
      <SkeletonPlaceholder.Item width={100} height={20} borderRadius={4} marginTop={10} />
    </SkeletonPlaceholder.Item>

    <SkeletonPlaceholder.Item height={1} marginVertical={30} borderColor="#E2E2E2" borderWidth={1} />
  </SkeletonPlaceholder>
);

export default TicketSkeleton;
