import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ShowcaseHome from '@/components/showcase/ShowcaseHome';
import ShowcaseCategoryPage from '@/components/showcase/ShowcaseCategoryPage';

export default function ComponentShowcase() {
  const { categoryId } = useParams();

  if (categoryId) {
    return <ShowcaseCategoryPage categoryId={categoryId} />;
  }
  return <ShowcaseHome />;
}