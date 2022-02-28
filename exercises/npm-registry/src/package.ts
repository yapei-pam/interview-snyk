import { RequestHandler } from 'express';
import got from 'got';
import { NPMPackage } from './types';
import latestVersion from 'latest-version';
/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  const { name, version } = req.params;

  try {
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();

    const latest = await latestVersion(name);

    const packageVersion = version !== 'undefined' ? version : latest;
    const dependencies = npmPackage?.versions?.[packageVersion]?.dependencies || null;

    return res.status(200).json({ dependencies, query: name.concat(`@${packageVersion}`) });

  } catch (error) {
    return next(error);
  }
};
