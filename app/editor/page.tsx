'use client';
import React, { Suspense } from 'react';
import { Editor } from './Editor';

const page = () => {
  return (
    <Suspense fallback={'loading...'}>
      <Editor />
    </Suspense>
  );
};

export default page;
